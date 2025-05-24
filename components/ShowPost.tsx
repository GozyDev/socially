import { getPost } from '@/app/action/post.action'
import React from 'react'
import PostCard from './PostCard'
import { getUserId } from '@/app/action/user.action'

async function ShowPost() {
    const posts = await getPost()
    const userId = await getUserId()
   
  
    
  return (
    <div className='space-y-5'>
        {posts.map(post => <PostCard key={post.id} post={post} dbUserId={userId} />)}
    </div>
  )
}

export default ShowPost 