"use client";
import React, { use, useState } from "react";
import { Card, CardContent } from "./ui/card";

import { Avatar, AvatarImage } from "./ui/avatar";
import {
  createComment,
  deletePost,
  getPost,
  toggleLike,
} from "@/app/action/post.action";
import { Loader2Icon } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import toast from "react-hot-toast";
import DeleteDialog from "./DeleteDialog";

type Posts = Awaited<ReturnType<typeof getPost>>;
type Post = Posts[0];
function PostCard({ post, userId }: { post: Post; userId: string | null }) {
  const [newComment, setNewComment] = useState("No worries");
  const [isCommenting, setIsCommenting] = useState(false);
  const [isLiking, setLiking] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [hasliked, setHasLiked] = useState(
    post.likes.some((like) => like.userId === userId)
  );
  const [Likes, setLikes] = useState(post._count.likes);
  const [comments, setComments] = useState(post._count.comments);
  const clerkUser = useUser();
  console.log(clerkUser);

  const handleLikes = async () => {
    if (isLiking) return;
    try {
      setLiking(true);
      setHasLiked(!hasliked);
      setLiking(false);
      setLikes((prev) => prev + (hasliked ? -1 : 1));
      const result = await toggleLike(post.id);
      console.log(result);
    } catch {
      setLikes(post._count.likes);
      setHasLiked(post.likes.some((like) => like.userId === userId));
    } finally {
      setLiking(false);
    }
  };

  const handleComment = async () => {
    if (!newComment.trim() || isCommenting)
      alert("bitch you will never learn what are you trying to do now");
    try {
      setIsCommenting(true);
      const comment = await createComment(newComment, post.id);
      setComments((prev) => prev + (hasliked ? -1 : 1));
      if (comment?.success) {
        toast.success("comment created successfully");
        setNewComment("");
      }
    } catch (error) {
      setLikes(post._count.comments);

      toast.error("Error creating Commment");
    } finally {
      setIsCommenting(false);
    }
  };

  const handledelete = async () => {
    try {
      setDeleting(true);
      const delAction = await deletePost(post.id);
      if (delAction?.success) toast.success("Post Deleted Successfully");
    } catch (error) {
      toast.error("failed to delete post");
      console.log(error);
    } finally {
      setDeleting(false)
    }
  };
  return (
    <Card>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className=" border-red-0 col-span-2">
                <Avatar className="w-10 h-10 border-2 ">
                  <AvatarImage
                    className="object-cover"
                    src={post.author.image || ""}
                  ></AvatarImage>
                </Avatar>
              </div>
              <div className=" border-red-0 col-span-10">
                <div className="flex gap-2 text-white/60">
                  {post.author.name !== " " ? (
                    <p className="text-sm">
                      {post.author.name === " " ? null : post.author.name}
                    </p>
                  ) : null}
                  <p className="text-sm">{post.author.username}</p>
                </div>
              </div>
            </div>

            <div>
              <DeleteDialog deleting={deleting} onDelete={handledelete} />
            </div>

          </div>
          {/* Content "text || image" */}
          <div>
            <p className="text-[15px] font-normal text-white/90">{post.content}</p>
          </div>
          <div className="flex items- gap-10">
            {/* Action container */}
            <div className="flex items-center gap-2">
              {/* like div */}
              <button
                onClick={handleLikes}
                className={`text-sm py-[5px] px-[15px] ${
                  hasliked ? "bg-pink-800 " : "bg-gray-800"
                } rounded`}
              >
                {isLiking ? <Loader2Icon className="animate-spin" /> : "like"}
              </button>
              <p className="text-sm">{Likes}</p>
            </div>

            <div className="flex items-center gap-2">
              {/* comment div */}
              <button
                onClick={handleComment}
                className="text-sm py-[5px] px-[15px] bg-blue-800 rounded"
              >
                {!isCommenting ? (
                  "comment"
                ) : (
                  <>
                    <Loader2Icon className="animate-spin" />
                    commenting
                  </>
                )}
              </button>

              <p className="text-sm">{comments}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default PostCard;
