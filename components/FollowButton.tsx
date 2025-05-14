"use client";
import React, { useState } from "react";
import { Button } from "./ui/button";
import { Loader2Icon } from "lucide-react";
import { toggleFollow } from "@/app/action/user.action";
import toast from "react-hot-toast";

function FollowButton({ userId }: { userId: string }) {
  const [isLoading, setIsLoading] = useState(false);

  // Define the click handler once
  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const data = await toggleFollow(userId);
      if (data?.success) {
        toast.success("Followed successfully!");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong during follow");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button size="sm" variant="secondary" disabled={isLoading} onClick={handleSubmit}>
      {isLoading ? <Loader2Icon className="animate-spin" /> : "Follow"}
    </Button>
  );
}

export default FollowButton;
