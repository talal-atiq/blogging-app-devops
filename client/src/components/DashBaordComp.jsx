import axios from 'axios';
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';

const DashBaordComp = () => {

    const [userData, setUserData] = useState([]);
    const [blogsData, setBlogsData] = useState([]);
    const [commentsData, setCommetsData] = useState([]);

    const [totalUsers, setTotalUser] = useState(0);
    const [totalBlogPosts, setTotalBlogPost] = useState(0);
    const [totalComments, setTotalComments] = useState(0);

    const [lastMonthUsers, setLastMonthUsers] = useState(0);
    const [lastMonthPosts, setLastMonthsPost] = useState(0);
    const [lastMonthComments, setLastMonthComments] = useState(0);

    const { user } = useSelector((state) => state.userSliceApp);




    useEffect(() => {

        const fetchUser = async () => {
            try {
                const fetchUserDetails = await axios.get(`/api/user/getusers?user=5`, {
                    headers: {
                        Authorization: user.token
                    }
                });

                if (fetchUserDetails.status === 200) {
                    setUserData(fetchUserDetails.data.user)
                    setTotalUser(fetchUserDetails.data.countUser)
                    setLastMonthUsers(fetchUserDetails.data.lastMonthUsers)
                }

            } catch (error) {
                toast.error(error.message)
                console.log(error.message);
            }
        }

        const fetchBlog = async () => {
            try {
                const fetchBlogDetails = await axios.get(`/api/blog/get-all-blogs?limit=5`);

                if (fetchBlogDetails.status === 200) {
                    setBlogsData(fetchBlogDetails.data.blogs)
                    setTotalBlogPost(fetchBlogDetails.data.countBlogs)
                    setLastMonthsPost(fetchBlogDetails.data.lastMonthBlogs)
                }
            } catch (error) {
                toast.error(error.message);
                console.log(error.message);
            }
        }

        const fetchComments = async () => {
            try {
                const fetchCommentDetails = await axios.get(`/api/comment/get-all-comments?limitComments=5`, {
                    headers: {
                        Authorization: user.token
                    }
                });
                if (fetchCommentDetails.status === 200) {
                    setCommetsData(fetchCommentDetails.data.comments)
                    setTotalComments(fetchCommentDetails.data.countDocument)
                    setLastMonthComments(fetchCommentDetails.data.lastMonthComment);
                }
            } catch (error) {
                toast.error(error.message);
                console.log(error.message);
            }
        }

        if (user.isAdmin) {
            fetchUser();
            fetchBlog();
            fetchComments();
        }

    }, [user]);


    return (
        <>
            <div className="">
                <h1>Dashboard component</h1>
            </div>
        </>
    )
}

export default DashBaordComp;