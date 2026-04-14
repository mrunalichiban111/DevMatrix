use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};

declare_id!("4SnGQnEKoYUKMyjG2GK22NdzBBH5mh7PNrodx9EXhWkh");

const VIRALITY_THRESHOLD: u64 = 50;
const CREATOR_FEE_BPS: u16 = 500;
const MIN_BET_LAMPORTS: u64 = 10_000_000; // ✅ 0.01 SOL minimum instead of fixed

#[program]
pub mod trendfi {
    use super::*;

    pub fn initialize_market(
        ctx: Context<InitializeMarket>,
        nft_mint: Pubkey,
        duration_seconds: i64,
    ) -> Result<()> {
        require!(duration_seconds > 0, CustomError::InvalidDuration);

        let now = Clock::get()?.unix_timestamp;
        let pool = &mut ctx.accounts.pool;

        pool.nft_mint = nft_mint;
        pool.creator = ctx.accounts.creator.key();
        pool.start_ts = now;
        pool.end_ts = now
            .checked_add(duration_seconds)
            .ok_or(CustomError::MathOverflow)?;

        pool.total_up_bets = 0;
        pool.total_down_bets = 0;
        pool.up_bettors = 0;
        pool.down_bettors = 0;

        pool.virality_score = 0;
        pool.reward_pool_lamports = 0;
        pool.creator_fee_lamports = 0;
        pool.creator_fee_bps = CREATOR_FEE_BPS;

        pool.finalized = false;
        pool.result = 0;

        Ok(())
    }

    pub fn place_bet(ctx: Context<PlaceBet>, amount: u64, side: u8) -> Result<()> {
        let now = Clock::get()?.unix_timestamp;
        let pool = &mut ctx.accounts.pool;
        let pool_info = pool.to_account_info();
        let user_bet = &mut ctx.accounts.user_bet;

        require!(!pool.finalized, CustomError::AlreadyFinalized);
        require!(now < pool.end_ts, CustomError::MarketClosed);
        require!(side <= 1, CustomError::InvalidSide);
        require!(amount >= MIN_BET_LAMPORTS, CustomError::BetTooSmall); 

        let cpi_accounts = Transfer {
            from: ctx.accounts.user.to_account_info(),
            to: pool_info,
        };
        transfer(
            CpiContext::new(ctx.accounts.system_program.to_account_info(), cpi_accounts),
            amount, 
        )?;

        user_bet.user = ctx.accounts.user.key();
        user_bet.pool = pool.key();
        user_bet.amount = amount; 
        user_bet.side = side;
        user_bet.claimed = false;

        if side == 0 {
            pool.total_up_bets = pool
                .total_up_bets
                .checked_add(amount)
                .ok_or(CustomError::MathOverflow)?;
            pool.up_bettors = pool.up_bettors.checked_add(1).ok_or(CustomError::MathOverflow)?;
        } else {
            pool.total_down_bets = pool
                .total_down_bets
                .checked_add(amount)
                .ok_or(CustomError::MathOverflow)?;
            pool.down_bettors = pool.down_bettors.checked_add(1).ok_or(CustomError::MathOverflow)?;
        }

        Ok(())
    }

    
    pub fn finalize_market(ctx: Context<FinalizeMarket>, virality_score: u64) -> Result<()> {
        let now = Clock::get()?.unix_timestamp;
        let pool = &mut ctx.accounts.pool;

        require!(!pool.finalized, CustomError::AlreadyFinalized);
        require!(now >= pool.end_ts, CustomError::MarketStillActive);

        pool.virality_score = virality_score;
        pool.result = if virality_score >= VIRALITY_THRESHOLD { 0 } else { 1 };
        pool.finalized = true;

        let total_pool = pool
            .total_up_bets
            .checked_add(pool.total_down_bets)
            .ok_or(CustomError::MathOverflow)?;

        pool.creator_fee_lamports = total_pool
            .checked_mul(pool.creator_fee_bps as u64)
            .ok_or(CustomError::MathOverflow)?
            / 10_000;

        pool.reward_pool_lamports = total_pool
            .checked_sub(pool.creator_fee_lamports)
            .ok_or(CustomError::MathOverflow)?;

        if pool.creator_fee_lamports > 0 {
            let pool_info: AccountInfo = pool.to_account_info();
            let creator_info = ctx.accounts.creator.to_account_info();

            require!(
                pool_info.lamports() >= pool.creator_fee_lamports,
                CustomError::InsufficientPoolBalance
            );

            **pool_info.try_borrow_mut_lamports()? -= pool.creator_fee_lamports;
            **creator_info.try_borrow_mut_lamports()? += pool.creator_fee_lamports;
        }

        Ok(())
    }

    pub fn claim_reward(ctx: Context<ClaimReward>) -> Result<()> {
        let pool = &ctx.accounts.pool;
        let user_bet = &mut ctx.accounts.user_bet;

        require!(pool.finalized, CustomError::NotFinalized);
        require!(!user_bet.claimed, CustomError::AlreadyClaimed);
        require!(user_bet.side == pool.result, CustomError::NotWinner);

        let winning_total = if pool.result == 0 {
            pool.total_up_bets
        } else {
            pool.total_down_bets
        };

        require!(winning_total > 0, CustomError::NoWinners);

        let reward = user_bet
            .amount
            .checked_mul(pool.reward_pool_lamports)
            .ok_or(CustomError::MathOverflow)?
            / winning_total;

        require!(reward > 0, CustomError::RewardTooSmall);

        let pool_info = ctx.accounts.pool.to_account_info();
        let user_info = ctx.accounts.user.to_account_info();

        require!(pool_info.lamports() >= reward, CustomError::InsufficientPoolBalance);

        **pool_info.try_borrow_mut_lamports()? -= reward;
        **user_info.try_borrow_mut_lamports()? += reward;

        user_bet.claimed = true;

        Ok(())
    }
}


#[derive(Accounts)]
#[instruction(nft_mint: Pubkey, duration_seconds: i64)]
pub struct InitializeMarket<'info> {
    #[account(
        init,
        payer = creator,
        seeds = [b"pool", nft_mint.as_ref()],
        bump,
        space = 8 + Pool::LEN
    )]
    pub pool: Account<'info, Pool>,
    #[account(mut)]
    pub creator: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct PlaceBet<'info> {
    #[account(mut, seeds = [b"pool", pool.nft_mint.as_ref()], bump)]
    pub pool: Account<'info, Pool>,
    #[account(
        init,
        payer = user,
        seeds = [b"user-bet", pool.key().as_ref(), user.key().as_ref()],
        bump,
        space = 8 + UserBet::LEN
    )]
    pub user_bet: Account<'info, UserBet>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct FinalizeMarket<'info> {
    #[account(mut, seeds = [b"pool", pool.nft_mint.as_ref()], bump)]
    pub pool: Account<'info, Pool>,
    #[account(mut, address = pool.creator)]
    pub creator: SystemAccount<'info>,
}

#[derive(Accounts)]
pub struct ClaimReward<'info> {
    #[account(mut, seeds = [b"pool", pool.nft_mint.as_ref()], bump)]
    pub pool: Account<'info, Pool>,
    #[account(
        mut,
        seeds = [b"user-bet", pool.key().as_ref(), user.key().as_ref()],
        bump,
        has_one = user
    )]
    pub user_bet: Account<'info, UserBet>,
    #[account(mut)]
    pub user: Signer<'info>,
}

#[account]
pub struct Pool {
    pub nft_mint: Pubkey,
    pub creator: Pubkey,
    pub start_ts: i64,
    pub end_ts: i64,
    pub total_up_bets: u64,
    pub total_down_bets: u64,
    pub up_bettors: u64,
    pub down_bettors: u64,
    pub virality_score: u64,
    pub reward_pool_lamports: u64,
    pub creator_fee_lamports: u64,
    pub creator_fee_bps: u16,
    pub finalized: bool,
    pub result: u8,
}

impl Pool {
    pub const LEN: usize = 32+32+8+8+8+8+8+8+8+8+8+2+1+1;
}

#[account]
pub struct UserBet {
    pub user: Pubkey,
    pub pool: Pubkey,
    pub amount: u64,
    pub side: u8,
    pub claimed: bool,
}

impl UserBet {
    pub const LEN: usize = 32+32+8+1+1;
}

#[error_code]
pub enum CustomError {
    #[msg("Market already finalized")]
    AlreadyFinalized,
    #[msg("Market is still active")]
    MarketStillActive,
    #[msg("Market has closed")]
    MarketClosed,
    #[msg("Reward already claimed")]
    AlreadyClaimed,
    #[msg("No winners in this market")]
    NoWinners,
    #[msg("Invalid side")]
    InvalidSide,
    #[msg("Bet amount too small")]
    BetTooSmall, // ✅ new error
    #[msg("You are not a winner")]
    NotWinner,
    #[msg("Insufficient pool balance")]
    InsufficientPoolBalance,
    #[msg("Invalid duration")]
    InvalidDuration,
    #[msg("Math overflow")]
    MathOverflow,
    #[msg("Reward too small")]
    RewardTooSmall,
    #[msg("Market is not finalized")]
    NotFinalized,
}