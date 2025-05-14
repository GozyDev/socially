"use server";

import prisma from "@/lib/prisma";
import { getUserId } from "./user.action";
import { revalidatePath } from "next/cache";

export async function createPost(content: string, image: string) {
  try {
    const authorId: string = await getUserId();
    const post = await prisma.post.create({
      data: {
        content,
        image,
        authorId,
      },
    });

    revalidatePath("/");
    return { sucess: true, post };
  } catch (error) {
    return { sucess: false, error };
  }
}

export async function getPost() {
  const post = await prisma.post.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      author: {
        select: {
          name: true,
          image: true,
          username: true,
        },
      },

      comments: {
        include: {
          author: {
            select: {
              name: true,
              image: true,
              username: true,
            },
          },
        },

        orderBy: { createdAt: "desc" },
      },

      likes: {
        include: {
          user: {
            select: {
              name: true,
              username: true,
              image: true,
            },
          },
        },
      },

      _count: {
        select: {
          comments: true,
          likes: true,
        },
      },
    },
  });
  return post;
}

export async function toggleLike(postId: string) {
  const userId = await getUserId();

  try {
    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
      select: {
        authorId: true,
      },
    });

    if (!post) return;
    const exisingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    if (exisingLike) {
      //unlike
      const deleteLikeRecord = await prisma.like.delete({
        where: {
          userId_postId: {
            userId,
            postId,
          },
        },
      });
    } else {
      // like

      await prisma.$transaction([
        prisma.like.create({
          data: {
            postId,
            userId,
          },
        }),
        ...(userId !== post?.authorId
          ? [
              prisma.notification.create({
                data: {
                  type: "LIKE",
                  userId: post.authorId,
                  creatorId: userId,
                  postId,
                },
              }),
            ]
          : []),
      ]);
    }

    revalidatePath("/");
    return { succes: true };
  } catch (error) {
    console.log("Error on Like Action ", error);
    return { error: false };
  }
}

export async function createComment(content: string, postId: string) {
  const userId = await getUserId();

  try {
    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },

      select: {
        authorId: true,
      },
    });
    if (!post) return;
    if (!userId && !postId && !content) return;
    // Create comment and notification in a transaction
    const [comment] = await prisma.$transaction(async (tx) => {
      // Create comment first
      const newComment = await tx.comment.create({
        data: {
          content,
          authorId: userId,
          postId,
        },
      });

      // Create notification if commenting on someone else's post
      if (post.authorId !== userId) {
        await tx.notification.create({
          data: {
            type: "COMMENT",
            userId: post.authorId,
            creatorId: userId,
            postId,
            commentId: newComment.id,
          },
        });
      }
      return [newComment];
    });
    revalidatePath("/");
    return { success: true, comment };
  } catch (error) {
    console.log("Faild to create comment", error);
    return { success: false, error: "Faild to create comment" };
  }
}

export async function deletePost(postId: string) {
  const userId = await getUserId();
  if (!userId) return;
  try {
    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
      select: {
        authorId: true,
      },
    });
    if (!post) return;

    if (post.authorId !== userId)
      throw new Error(
        "Unauthorize action you cant delete a post that not yours"
      );

    await prisma.post.delete({
      where: {
        id: postId,
      },
    });

    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.log(error);
    return { success: false, error: "Error Deleting post" };
  }
}
