import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getMongoClient, getMongoDbName } from '@/lib/mongodb';

type RouteContext = {
  params: {
    mint: string;
  };
};

type CommentDoc = {
  _id: ObjectId;
  mint: string;
  author: string;
  content: string;
  createdAt: Date;
};

const COLLECTION_NAME = 'fish_comments';

export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const client = await getMongoClient();
    const db = client.db(getMongoDbName());

    const comments = (await db
      .collection<CommentDoc>(COLLECTION_NAME)
      .find({ mint: params.mint })
      .sort({ createdAt: -1 })
      .limit(200)
      .toArray()) as CommentDoc[];

    return NextResponse.json({
      comments: comments.map((comment) => ({
        id: comment._id.toString(),
        mint: comment.mint,
        author: comment.author,
        content: comment.content,
        createdAt: comment.createdAt.toISOString(),
      })),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch comments.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const body = (await request.json()) as { author?: string; content?: string };
    const content = (body.content || '').trim();
    const author = (body.author || 'anon').trim() || 'anon';

    if (!content) {
      return NextResponse.json({ error: 'Comment cannot be empty.' }, { status: 400 });
    }

    if (content.length > 500) {
      return NextResponse.json({ error: 'Comment is too long. Max 500 characters.' }, { status: 400 });
    }

    const client = await getMongoClient();
    const db = client.db(getMongoDbName());

    const payload = {
      mint: params.mint,
      author: author.slice(0, 40),
      content,
      createdAt: new Date(),
    };

    const insertResult = await db.collection(COLLECTION_NAME).insertOne(payload);

    return NextResponse.json(
      {
        comment: {
          id: insertResult.insertedId.toString(),
          mint: payload.mint,
          author: payload.author,
          content: payload.content,
          createdAt: payload.createdAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to create comment.' },
      { status: 500 }
    );
  }
}
