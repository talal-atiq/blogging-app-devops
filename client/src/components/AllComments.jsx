import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { Table } from "flowbite-react";
import Spinner from "../assests/spinner/Spinner";
import { NavLink } from "react-router-dom";
import { ImWarning } from "react-icons/im";
import { IoClose } from "react-icons/io5";
import toast, { Toaster } from "react-hot-toast";


const AllComments = () => {
    const { user } = useSelector((state) => state.userSliceApp);
    const { theme } = useSelector((state) => state.themeSliceApp);
    const [loader, setLoader] = useState(false);
    const [showMoreButton, setShowMoreButton] = useState(false);
    const [getAllComments, setAllComments] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [commentIdToDelete, setCommentIdToDelete] = useState("");
    const [startPage, setStartPage] = useState(1);









    // Fetch Comments :
    useEffect(() => {
        if (user.isAdmin) {
            const getComments = async () => {
                try {
                    const commentInfo = await axios.get(`/api/comment/get-all-comments`, {
                        headers: {
                            Authorization: user.token,
                        },
                    });
                    const response = commentInfo.data.comments;
                    setAllComments(response);
                    if (response.length > 4) {
                        setShowMoreButton(true);
                    }
                } catch (error) {
                    console.log(error.message);
                }
            };
            getComments();
        }
    }, []);

    const deleteUserHandle = (id) => {
        setShowModal(true);
        setCommentIdToDelete(id);
    };

    const cancelHandle = () => {
        setShowModal(false);
    };


    // Show more comments 
    const showMoreCommentButton = async () => {
        try {
            const response = await axios.get(`/api/comment/get-all-comments?page=${startPage + 1}`, {
                headers: {
                    Authorization: user.token
                },
               
            });

            if (response.status === 200) {
                const newComment = response.data.comments;
                setStartPage(startPage + 1)
                console.log(newComment);
                setAllComments([...getAllComments, ...newComment])


                if (response.data.comments.length === 0) {
                    setShowMoreButton(false);
                    toast.success('All blogs have been fetched');
                }
            }
        } catch (error) {
            console.log(error.message);
        }
    };






    const yesToDeleteComment = async () => {
        try {
            const response = await axios.delete(`/api/comment/delete-comment/${commentIdToDelete}`, {

                data: {
                    user: user
                },
                headers: {
                    Authorization: user.token
                }
            })
            if (response.status === 200) {
                console.log(response.data);
                setAllComments(getAllComments.filter(commentValue => commentValue._id !== commentIdToDelete));
                toast.success('Comment has been deleted');
                setShowModal(false);
            }
        } catch (error) {
            toast.error(error.message)
            console.log(error.message);
        }
    }

    return (
        <>
            <div
                className={`min-h-screen shadow-sm border my-2 rounded-md w-full md:mx-5 table-auto overflow-x-scroll scrollbar  ${theme === "dark" ? "border-zinc-700" : "border-gray-200"
                    } mx-2 md:mx-0`}
            >
                {getAllComments.length > 0 && (
                    <Table hoverable className={`my-5`}>
                        <Table.Head
                            className={` text-base   ${theme === "dark"
                                ? "text-gray-100 bg-gray-700"
                                : "text-gray-700 bg-gray-300"
                                } `}
                        >
                            <Table.HeadCell
                                className={`text-center font-semibold  md:text-sm text-xs  ${theme === "dark" && "border-gray-500"
                                    } `}
                            >
                                Updated on
                            </Table.HeadCell>

                            <Table.HeadCell
                                className={` text-center font-semibold md:text-sm text-xs  ${theme === "dark" && "border-gray-500"
                                    } `}
                            >
                                Comments
                            </Table.HeadCell>

                            <Table.HeadCell
                                className={` text-center font-semibold md:text-sm text-xs  ${theme === "dark" && "border-gray-500"
                                    } `}
                            >
                                No.of likes
                            </Table.HeadCell>

                            <Table.HeadCell
                                className={`text-center font-semibold md:text-sm text-xs  ${theme === "dark" && "border-gray-500"
                                    } `}
                            >
                                <span>PostId</span>
                            </Table.HeadCell>

                            <Table.HeadCell
                                className={`pr-2  md:pr-0 text-center font-semibold md:text-sm text-xs ${theme === "dark" && "border-gray-500"
                                    } `}
                            >
                                UserId
                            </Table.HeadCell>

                            <Table.HeadCell
                                className={`pl-2 md:pl-0 font-semibold md:text-sm text-xs  ${theme === "dark" && "border-gray-500"
                                    } `}
                            >
                                Delete
                            </Table.HeadCell>
                        </Table.Head>
                        {loader ? (
                            <Spinner />
                        ) : (
                            <>
                                {getAllComments.map((comments, index) => {
                                    return (
                                        <Table.Body key={index} className="">
                                            <Table.Row key={index}
                                                className={` text-xs md:text-sm  transition-all rounded-md  ${theme === "dark"
                                                    ? "hover:bg-gray-800"
                                                    : "hover:bg-slate-100"
                                                    }`}
                                            >
                                                <Table.Cell className="text-center px-2 md:px-0 text-xs md:text-sm">
                                                    {new Date(comments.updatedAt).toLocaleDateString()}
                                                </Table.Cell>

                                                <Table.Cell className="flex px-2 w-52 md:px-0 justify-center">
                                                    <NavLink className="" to={`/blog`}>
                                                        <span className="">{comments.comment}</span>
                                                    </NavLink>
                                                </Table.Cell>

                                                <Table.Cell
                                                    className={`px-3 md:px-0 border-l border-r text-center text-xs md:text-sm ${theme === "dark" && "text-gray-300 border-gray-700"
                                                        }`}
                                                >
                                                    <span>{comments.likes.length}</span>
                                                </Table.Cell>

                                                <Table.Cell className="text-center md:px-0 px-5">
                                                    <span className="">{comments.blogId}</span>
                                                </Table.Cell>

                                                <Table.Cell className="text-xs px-5 md:px-0 md:text-sm text-center">
                                                    <span>{comments.userId}</span>
                                                </Table.Cell>

                                                <Table.Cell>
                                                    <button
                                                        className="text-red-500 px-3 md:px-0 hover:underline"
                                                        onClick={() => {
                                                            deleteUserHandle(comments._id);
                                                        }}
                                                    >
                                                        Delete
                                                    </button>
                                                </Table.Cell>
                                            </Table.Row>
                                        </Table.Body>
                                    );
                                })}
                            </>
                        )}
                    </Table>
                )}

                {showMoreButton && (
                    <div className="text-center my-5">
                        <button
                            onClick={showMoreCommentButton}
                            className={`transition-all active:scale-95 hover:bg-blue-900 py-2 font-semibold text-sm px-2 border-2 rounded-md  ${theme === "dark"
                                ? "bg-gray-700 active:bg-gray-800 text-gray-200 border-gray-400"
                                : "active:bg-gray-600 active:text-white hover:text-white bg-gray-300 text-gray-800 border-gray-500"
                                }`}
                        >
                            Show more..
                        </button>
                    </div>
                )}
            </div>

            {/* Showing Modal before deleting the Comments */}
            {showModal && (
                <div className="fixed inset-0  transition-all backdrop-blur-sm bg-opacity-30 flex justify-center items-center">
                    <div
                        className={`flex flex-col gap-7  shadow-md w-80 md:w-96 bg- rounded-md  px-3 justify-center items-center py-5   ${theme === "dark"
                            ? "bg-zinc-800 text-gray-200"
                            : "bg-white text-gray-900"
                            }`}
                    >
                        <button
                            className="place-self-end transition-all"
                            onClick={cancelHandle}
                        >
                            <IoClose
                                size={25}
                                className=" active:animate-ping transition-all"
                            />
                        </button>

                        <div className="">
                            <ImWarning size={40} />
                        </div>

                        <div className="">
                            <p className="text-base text-center">
                                Are you sure you want to delete this comment ?
                            </p>
                        </div>

                        <div className="flex gap-4">
                            <button
                                className={`text-sm  rounded-md transition-all active:bg-red-800 font-semibold py-2 px-2 active:scale-95  ${theme === "dark" ? "bg-red-700" : "bg-red-400"
                                    }`}
                                onClick={yesToDeleteComment}
                            >
                                Yes,I'm sure.
                            </button>

                            <button
                                className=" border text-sm font-semibold  active:scale-95 transition-all bg-transparent rounded-md py-2 px-3 active:bg-gray-600"
                                onClick={cancelHandle}
                            >
                                No, cancel.
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <Toaster />
        </>
    );
};

export default AllComments;
