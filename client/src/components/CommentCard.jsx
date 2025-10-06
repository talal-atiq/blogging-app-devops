import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom';
import { AiOutlineComment } from "react-icons/ai";
import feedbackImg from '../assests/typingImg.png'
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';
import UserComment from './UserComment';
import { IoClose } from "react-icons/io5";
import { ImWarning } from "react-icons/im";
import Spinner from '../assests/spinner/Spinner';







const CommentCard = ({ blogId }) => {

    const { user } = useSelector((state) => state.userSliceApp);
    const { theme } = useSelector((state) => state.themeSliceApp);
    const navigate = useNavigate();

    const [commentData, setCommentData] = useState('');
    const [comments, setComments] = useState([]);
    const [modal, setModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [propsCommentId, setPropsCommentId] = useState()






    const commentSubmitHandle = (e) => {
        e.preventDefault()
        formValidate(commentData)

    }

    const textAreaChange = (e) => {
        const { value } = e.target;
        setCommentData(value)
    }

    const formValidate = (commentText) => {
        if (!commentText) {
            toast.error('Comment is empty!')
            return false;
        } else if (commentText.length < 4) {
            toast.error('Atleast four characters required!')
            return false;
        } else {
            postUserComment();
        }
    }

    // POST Api : Add comment - 
    const postUserComment = async () => {

        try {

            if (!user) {
                toast.error('You must login to post comment!');
                return;
            }
            setLoading(true);
            const addComment = await axios.post(`/api/comment/add-comment/`,
                {
                    comment: commentData,
                    blogId: blogId,
                    userId: user._id
                },
                {
                    headers: {
                        Authorization: user.token
                    }
                })
            if (addComment.status === 200) {

                toast.success('Comment has been added');
                setCommentData('')

                setComments([...comments, addComment.data.comment])
            }
            setLoading(false);
        } catch (error) {
            setLoading(false);
            toast.error('An error occured while adding new comments!');
            console.log(error);
        }
    };


    //Get user comment : 
    useEffect(() => {
        const getComment = async () => {
            try {
                const comment = await axios.get(`/api/comment/get-comment/${blogId}`);

                if (comment.status === 200) {
                    setComments(comment.data)
                }
            } catch (error) {
                console.log(error.message);
            }
        }
        getComment();

    }, [blogId]);



    // PUT API - For liking the comment 
    const likeTheComment = async (commentId) => {
        try {
            if (!user) {
                navigate('/login');
                return;
            }

            const doLike = await axios.put(`/api/comment/like-the-comment/${commentId}`, { user: user._id }, {
                headers: {
                    Authorization: user.token
                },
            })

            if (doLike.status === 200) {
                setComments(comments.map(comments => {

                    if (comments._id === commentId) {

                        return {
                            ...comments,
                            likes: doLike.data.likes,
                            numberOfLikes: doLike.data.numberOfLikes
                        }
                    }
                    return comments;
                }))
            }
        } catch (error) {
            console.log(error.message);
        }
    }



    // Updating comment functionality :

    const updateComment = async (commentId, updatedCommentInfo) => {

        setComments(comments.map(commentLists => {
            if (commentLists._id === commentId) {
                return {
                    ...commentLists, comment: updatedCommentInfo
                }
            }
            return commentLists;
        }))
    };

    const cancelHandle = () => {
        setModal(false)
    }



    const deleteComment = (commentId) => {
        setPropsCommentId(commentId)
        setModal(true)
    }


    // Comment to delete if the delete if the confirm button is cliekd 
    const okToDeleteComment = async (propsCommentId) => {
        try {
            const deleteResponse = await axios.delete(`/api/comment/delete-comment/${propsCommentId}`, {
                headers: {
                    Authorization: user.token
                },
                data: {
                    user
                }
            })
            if (deleteResponse.status === 200) {
                setModal(false)
                toast.success(deleteResponse.data.message)
                setComments(comments.filter((commentInfo) => commentInfo._id !== propsCommentId))

            }
        } catch (error) {
            toast.error(error.message);
            console.log(error.message);
        }
    }








    return (

        <div className='md:mt-10 mt-5'>

            {
                user ?

                    <div className="">

                        <p className='flex items-center lg:text-base sm:text-xs md:text-sm gap-3 justify-center '>Sign in as :<Link to={'/dashboard?tab=profile'} className='flex font-semibold text-sm text-teal-500 hover:underline cursor-pointer items-center'> <img src={user.profilePicture} className='w-7 h-7 rounded-full' /> @{user.username}</Link></p>
                    </div>

                    :
                    <div className="">
                        <span className='flex gap-2 text-xs md:text-sm text-teal-500 font-semibold'>Login to access more features and engage with users of this blog.
                            <Link className='text-blue-400 hover:underline' to={'/login'}>Login</Link>
                        </span>
                    </div>
            }

            {
                user &&
                <div className="w-full md:flex-row flex flex-col justify-center md:gap-10 items-center">

                    {/* Left Content  */}
                    <div className="flex justify-center items-center">
                        <img src={feedbackImg} alt="" className='w-72 md:96' />
                    </div>

                    {/* Right Content  */}
                    <div className={` py-2  px-5 rounded-md ${theme === 'dark' ? 'border border-gray-600 ' : 'border border-gray-300'}`}>
                        <div className="flex gap-2 py-2 items-center">
                            <h1 className={`text-sm font-semibold ${commentData.length === 50 && 'text-red-500'}`}>Share your feedback</h1>
                            <AiOutlineComment size={30} className={`${commentData.length === 50 && 'text-red-500'}`} />
                        </div>

                        <form className={`py-2  flex shadow-md flex-col  w-full px-1 md:px-5  rounded-md ${theme === 'dark' ? 'border border-gray-600 ' : 'border border-gray-300'}}`} onSubmit={commentSubmitHandle}>

                            <textarea value={commentData} onChange={textAreaChange} placeholder='Type here...' name="comment" className={` transition-all outline-none  w-80 rounded-md  py-3 px-2 ${theme === 'dark' ? 'bg-zinc-600 focus:bg-zinc-700' : 'bg-zinc-200 focus:bg-zinc-300'}`} maxLength={50}>

                            </textarea>
                            <span className={`text-xs md:text-sm  transition-all font-semibold ${commentData.length === 50 ? 'text-red-500 ' : 'text-green-500'}`}>{50 - commentData.length} characters left</span>


                            <button disabled={loading} type='submit' className={`active:scale-90 transition-all py-1 my-3 bg-gradient-to-r from-yellow-400 to-green-700 hover:from-pink-500 hover:to-yellow-500 w-full font-semibold ${loading && 'opacity-50 cursor-not-allowed'}`}>

                                {
                                    loading ? <div className="flex justify-center"><Spinner /> </div> : 'Submit'
                                }
                            </button>



                        </form>

                    </div>
                    <Toaster />
                </div >
            }

            {/* user comment card  */}

            <div className="">

                <div className="flex gap-3 items-center my-3">
                    <p className='text-sm '>Comments</p>
                    <span className='border flex items-center justify-center px-2  text-sm rounded-md'>{comments && comments.length}</span>
                </div>
                <hr className={` rounded-full ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`} />
            </div>

            {
                comments && comments.length === 0 ?

                    <p className='text-sm text-teal-500'>No comment found on this blog</p>
                    :
                    comments.map((value, index) => {
                        return (
                            <div className="" key={index}>
                                <UserComment comments={value} likeTheComment={likeTheComment} updateComment={updateComment} deleteComment={deleteComment} />
                            </div>
                        )
                    })
            }






            {/* Popup Modal  */}
            {
                modal && <div className="fixed inset-0  transition-all backdrop-blur-sm bg-opacity-30 flex justify-center items-center">
                    <div
                        className={`flex flex-col gap-7  shadow-md w-80 md:w-96 bg- rounded-md  px-3 justify-center items-center py-5   ${theme === "dark"
                            ? "bg-zinc-800 text-gray-200"
                            : "bg-white text-gray-900"
                            }`}
                    >
                        <button className="place-self-end transition-all" onClick={cancelHandle}>
                            <IoClose size={25} className=' active:animate-ping transition-all' />
                        </button>

                        <div className="">
                            <ImWarning size={40} />
                        </div>

                        <div className="">
                            <p className="text-base text-center">
                                Are you sure you want to delete your comment  ?
                            </p>
                        </div>

                        <div className="flex gap-4">
                            <button
                                className={`text-sm  rounded-md transition-all active:bg-red-800 font-semibold py-2 px-2 active:scale-95  ${theme === "dark" ? "bg-red-700" : "bg-red-400"
                                    }`}
                                onClick={() => {
                                    okToDeleteComment(propsCommentId)
                                }}
                            >
                                Yes,I'm sure
                            </button>

                            <button
                                className=" border text-sm font-semibold  active:scale-95 transition-all bg-transparent rounded-md py-2 px-3 active:bg-gray-600"
                                onClick={cancelHandle}
                            >
                                No, cancel
                            </button>
                        </div>
                    </div>
                </div>
            }
        </div>
    )
}

export default CommentCard;