import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { Table, Toast } from "flowbite-react";
import { NavLink } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import BlogPopupModal from "./BlogPopupModal";
import BlogLoader from "../assests/blogSpinner/BlogLoader";
import { PiSmileySad } from "react-icons/pi";

const AllBlogs = () => {
    const { user } = useSelector((state) => state.userSliceApp);
    const { theme } = useSelector((state) => state.themeSliceApp);
    const [userBlogs, setUserBlogs] = useState([]);
    const [showMoreButton, setShowMoreButton] = useState(false);
    const [blogModal, setBlogModal] = useState(false);
    const [blogId, setBlogId] = useState("");
    const [loader, setLoader] = useState(false);
    const [page, setPage] = useState(2);

    // Get blogs fetch api :
    useEffect(() => {
        if (user.isAdmin) {
            const getBlogs = async () => {
                setLoader(true);
                try {
                    const fetchBlogs = await axios.get(
                        `/api/blog/get-all-blogs?userId=${user._id}`
                    );

                    if (fetchBlogs.status === 200) {
                        setLoader(false);
                        setUserBlogs(fetchBlogs.data.blogs);

                        if (fetchBlogs.data.blogs) {
                            if (fetchBlogs.data.blogs.length > 5) {
                                setShowMoreButton(true);
                            } else {
                                setShowMoreButton(false);
                            }
                        }
                    }
                } catch (error) {
                    setLoader(false);
                    toast.error("An unexpected error occurred!");
                    console.log(error);
                }
            };
            getBlogs();
        }
    }, [user._id]);

    const deleteBlogHandle = (id) => {
        setBlogId(id);
        setBlogModal(true);
    };

    // Show More button api :
    const fetchBlogs = async (page = 2) => {
        try {
            const response = await axios.get(
                `/api/blog/get-all-blogs?${user._id}&page=${page}`
            );
            if (response.status === 200) {
                setUserBlogs([...response.data.blogs, ...userBlogs]);
                setPage(page + 1);

                if (response.data.blogs.length === 0) {
                    setShowMoreButton(false);
                    toast.success("All blogs have been fetched");
                }
            }
        } catch (error) {
            console.log(error.message);
        }
    };

    const showMoreBlogsButton = () => {
        fetchBlogs(page);
    };

    return (
        <>
            {user && user.isAdmin ? (
                <div
                    className={`transition-all min-h-screen border  my-2 mx-2 rounded-md w-full items-center md:mx-5 table-auto overflow-x-scroll scrollbar ${theme === "dark" ? "border-zinc-700" : "border-gray-300"
                        }`}
                >
                    <Table hoverable className="my-5">
                        <Table.Head
                            className={`text-base ${theme === "dark"
                                    ? "text-gray-100 bg-zinc-700 "
                                    : "text-gray-700 bg-gray-300"
                                }`}
                        >
                            <Table.HeadCell
                                className={`  md:text-sm text-xs  ${theme === "dark" && "border-gray-500"
                                    } items-center justify-center px-5`}
                            >
                                Updated on
                            </Table.HeadCell>

                            <Table.HeadCell
                                className={` px-5 md:px-2 md:text-sm text-xs ${theme === "dark" && "border-gray-500"
                                    } `}
                            >
                                Image
                            </Table.HeadCell>

                            <Table.HeadCell
                                className={` md:text-sm text-xs ${theme === "dark" && "border-gray-500"
                                    }  text-center`}
                            >
                                Blog Title
                            </Table.HeadCell>

                            <Table.HeadCell
                                className={` md:text-sm text-xs ${theme === "dark" && "border-gray-500"
                                    } px-5`}
                            >
                                Category
                            </Table.HeadCell>

                            <Table.HeadCell
                                className={` md:text-sm text-xs  ${theme === "dark" && "border-gray-500"
                                    } px-5 `}
                            >
                                <span>Edit</span>
                            </Table.HeadCell>

                            <Table.HeadCell
                                className={`md:text-sm text-xs ${theme === "dark" && "border-gray-500"
                                    } px-5`}
                            >
                                Delete
                            </Table.HeadCell>
                        </Table.Head>
                        {loader ? (
                            <Table.Body className="">
                                <Table.Row>
                                    <Table.Cell className="text-center mt-40">
                                        <BlogLoader />
                                    </Table.Cell>
                                </Table.Row>
                            </Table.Body>
                        ) : userBlogs.length === 0 ? (
                            <Table.Body>
                                <Table.Row>
                                    <Table.Cell colSpan="6" className="text-center">
                                        No blogs found
                                    </Table.Cell>
                                </Table.Row>
                            </Table.Body>
                        ) : (
                            userBlogs.map((data, index) => (
                                <Table.Body key={index}>
                                    <Table.Row
                                        className={`text-center text-xs md:text-sm transition-all rounded-md ${theme === "dark"
                                                ? "hover:bg-gray-800"
                                                : "hover:bg-gray-100"
                                            }`}
                                    >
                                        {/* Blog Date  */}
                                        <Table.Cell className="text-xs md:text-sm">
                                            {new Date(data.updatedAt).toLocaleDateString()}
                                        </Table.Cell>

                                        {/* Blog Image  */}
                                        <Table.Cell className="flex justify-center">
                                            <NavLink
                                                className="text-center"
                                                to={`/blog/${data.slug}`}
                                            >
                                                <img
                                                    src={data.blogImgFile}
                                                    alt="blogImage"
                                                    className="w-10 text-center rounded-full h-10 md:w-20 md:rounded-md"
                                                />
                                            </NavLink>
                                        </Table.Cell>

                                        {/* Blog Title  */}
                                        <Table.Cell
                                            className={`border-l border-r px-5 md:pl-10 text-xs md:text-justify text-left md:text-sm ${theme === "dark" && "text-gray-300 border-gray-700"
                                                }`}
                                        >
                                            <NavLink className="" to={`/blog/${data.slug}`}>
                                                <p>{data.blogTitle}</p>
                                            </NavLink>
                                        </Table.Cell>

                                        {/* Blog Category  */}
                                        <Table.Cell className="text-xs md:text-sm text-justify pl-5">
                                            {data.blogCategory}
                                        </Table.Cell>
                                        <Table.Cell>
                                            {/* Blog Edit Button  */}
                                            <NavLink
                                                to={`/update-blog/${data._id}`}
                                                className="text-green-500 hover:underline"
                                            >
                                                Edit
                                            </NavLink>
                                        </Table.Cell>
                                        <Table.Cell>
                                            {/* Blog Delete Button  */}
                                            <button
                                                className="text-red-500 hover:underline"
                                                onClick={() => deleteBlogHandle(data._id)}
                                            >
                                                Delete
                                            </button>
                                        </Table.Cell>
                                    </Table.Row>
                                </Table.Body>
                            ))
                        )}
                    </Table>
                    {showMoreButton && (
                        <div className="text-center my-5">
                            <button
                                onClick={showMoreBlogsButton}
                                className={`transition-all active:scale-95 hover:bg-blue-900 py-1 font-semibold text-xs px-2 border rounded-sm ${theme === "dark"
                                        ? "bg-gray-700 active:bg-gray-800 text-gray-300 border-gray-400"
                                        : "active:bg-gray-600 active:text-white hover:text-white bg-gray-300 text-gray-800 border-gray-500"
                                    }`}
                            >
                                Show more..
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="min-h-screen flex w-full justify-center items-center">
                    <span className="flex md:items-center absolute top-72 left-50 md:static md:justify-center">
                        <BlogLoader />
                    </span>
                </div>
            )}

            <Toaster />

            {/*  Conditionally rendering the popup modal :  */}
            {blogModal && (
                <BlogPopupModal
                    blogModal={blogModal}
                    setBlogModal={setBlogModal}
                    blogId={blogId}
                    setUserBlogs={setUserBlogs}
                />
            )}
        </>
    );
};

export default AllBlogs;
