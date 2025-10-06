import axios from 'axios';
import React from 'react'
import toast from 'react-hot-toast';
import { ImWarning } from 'react-icons/im';
import { IoClose } from 'react-icons/io5';
import { useSelector } from 'react-redux';





const BlogPopupModal = ({ setBlogModal, blogId, setUserBlogs }) => {



    const { theme } = useSelector((state) => state.themeSliceApp);
    const { user } = useSelector((state) => state.userSliceApp);



    const cancelHandle = () => {
        setBlogModal(false);
    };

    const deleteBlog = async () => {

        try {
            const deleteBlogInfo = await axios.delete(`/api/blog/delete-blog/${blogId}/${user._id}`, {
                data: {
                    user: user
                },
                headers: {
                    Authorization: user.token
                }
            });
            if (deleteBlogInfo.status === 200) {
                toast.success('Blog has been deleted successfully');
                setBlogModal(false)
                setUserBlogs((blogs) => blogs.filter(blog => blog._id !== blogId));
            }
        } catch (error) {
            console.log(error.message);
        }
    };



    return (
        <>

            <div className="fixed inset-0  transition-all backdrop-blur-sm bg-opacity-30 flex justify-center items-center">
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
                            Are you sure you want to delete your blog ?
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <button
                            className={`text-sm  rounded-md transition-all active:bg-red-800 font-semibold py-2 px-2 active:scale-95  ${theme === "dark" ? "bg-red-700" : "bg-red-400"
                                }`}
                            onClick={() => {
                                deleteBlog();
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
        </>
    )
}

export default BlogPopupModal;