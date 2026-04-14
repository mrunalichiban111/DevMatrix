/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/trendfi.json`.
 */
export type Trendfi = {
  "address": "4SnGQnEKoYUKMyjG2GK22NdzBBH5mh7PNrodx9EXhWkh",
  "metadata": {
    "name": "trendfi",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "claimReward",
      "discriminator": [
        149,
        95,
        181,
        242,
        94,
        90,
        158,
        162
      ],
      "accounts": [
        {
          "name": "pool",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  111,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "pool.nft_mint",
                "account": "pool"
              }
            ]
          }
        },
        {
          "name": "userBet",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  45,
                  98,
                  101,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "pool"
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "user",
          "writable": true,
          "signer": true,
          "relations": [
            "userBet"
          ]
        }
      ],
      "args": []
    },
    {
      "name": "finalizeMarket",
      "discriminator": [
        16,
        225,
        38,
        28,
        213,
        217,
        1,
        247
      ],
      "accounts": [
        {
          "name": "pool",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  111,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "pool.nft_mint",
                "account": "pool"
              }
            ]
          }
        },
        {
          "name": "creator",
          "writable": true
        }
      ],
      "args": [
        {
          "name": "viralityScore",
          "type": "u64"
        }
      ]
    },
    {
      "name": "initializeMarket",
      "discriminator": [
        35,
        35,
        189,
        193,
        155,
        48,
        170,
        203
      ],
      "accounts": [
        {
          "name": "pool",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  111,
                  108
                ]
              },
              {
                "kind": "arg",
                "path": "nftMint"
              }
            ]
          }
        },
        {
          "name": "creator",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "nftMint",
          "type": "pubkey"
        },
        {
          "name": "durationSeconds",
          "type": "i64"
        }
      ]
    },
    {
      "name": "placeBet",
      "discriminator": [
        222,
        62,
        67,
        220,
        63,
        166,
        126,
        33
      ],
      "accounts": [
        {
          "name": "pool",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  111,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "pool.nft_mint",
                "account": "pool"
              }
            ]
          }
        },
        {
          "name": "userBet",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  45,
                  98,
                  101,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "pool"
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "side",
          "type": "u8"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "pool",
      "discriminator": [
        241,
        154,
        109,
        4,
        17,
        177,
        109,
        188
      ]
    },
    {
      "name": "userBet",
      "discriminator": [
        180,
        131,
        8,
        241,
        60,
        243,
        46,
        63
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "alreadyFinalized",
      "msg": "Market already finalized"
    },
    {
      "code": 6001,
      "name": "marketStillActive",
      "msg": "Market is still active"
    },
    {
      "code": 6002,
      "name": "marketClosed",
      "msg": "Market has closed"
    },
    {
      "code": 6003,
      "name": "alreadyClaimed",
      "msg": "Reward already claimed"
    },
    {
      "code": 6004,
      "name": "noWinners",
      "msg": "No winners in this market"
    },
    {
      "code": 6005,
      "name": "invalidSide",
      "msg": "Invalid side"
    },
    {
      "code": 6006,
      "name": "betTooSmall",
      "msg": "Bet amount too small"
    },
    {
      "code": 6007,
      "name": "notWinner",
      "msg": "You are not a winner"
    },
    {
      "code": 6008,
      "name": "insufficientPoolBalance",
      "msg": "Insufficient pool balance"
    },
    {
      "code": 6009,
      "name": "invalidDuration",
      "msg": "Invalid duration"
    },
    {
      "code": 6010,
      "name": "mathOverflow",
      "msg": "Math overflow"
    },
    {
      "code": 6011,
      "name": "rewardTooSmall",
      "msg": "Reward too small"
    },
    {
      "code": 6012,
      "name": "notFinalized",
      "msg": "Market is not finalized"
    }
  ],
  "types": [
    {
      "name": "pool",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "nftMint",
            "type": "pubkey"
          },
          {
            "name": "creator",
            "type": "pubkey"
          },
          {
            "name": "startTs",
            "type": "i64"
          },
          {
            "name": "endTs",
            "type": "i64"
          },
          {
            "name": "totalUpBets",
            "type": "u64"
          },
          {
            "name": "totalDownBets",
            "type": "u64"
          },
          {
            "name": "upBettors",
            "type": "u64"
          },
          {
            "name": "downBettors",
            "type": "u64"
          },
          {
            "name": "viralityScore",
            "type": "u64"
          },
          {
            "name": "rewardPoolLamports",
            "type": "u64"
          },
          {
            "name": "creatorFeeLamports",
            "type": "u64"
          },
          {
            "name": "creatorFeeBps",
            "type": "u16"
          },
          {
            "name": "finalized",
            "type": "bool"
          },
          {
            "name": "result",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "userBet",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "pool",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "side",
            "type": "u8"
          },
          {
            "name": "claimed",
            "type": "bool"
          }
        ]
      }
    }
  ]
};
