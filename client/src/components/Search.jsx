import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import blogLoader from '../assests/blogSpinner/BlogLoader';
import NodataImg from '../assests/No data.png';






const Search = () => {

    const { theme } = useSelector((state) => state.themeSliceApp);
    const location = useLocation();
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showMoreButton, setShowMoreButton] = useState(false);
    const navigate = useNavigate();



    const [formData, setFormData] = useState({
        searchblog: '',
        sortblog: 'latest',
        blogcategory: 'uncategorized'

    });


    const inputChangeHandle = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData, [name]: value
        })
    }

    useEffect(() => {
        const URL = new URLSearchParams(location.search);
        const getBlog = URL.get('searchBlog');
        const getBlogCategory = URL.get('category');
        const sortBlog = URL.get('sort');

        if (getBlog || getBlogCategory || sortBlog) {

            setFormData((prevFormData) => ({
                ...prevFormData,
                searchblog: getBlog || prevFormData.searchblog,
                blogcategory: getBlogCategory || prevFormData.blogcategory,
                sortblog: sortBlog || prevFormData.sortblog
            }));




            const fetchBlogPosts = async () => {
                const stringConersionURL = URL.toString();
                try {
                    setLoading(true);
                    const response = await axios.get(`/api/blog/get-all-blogs?${stringConersionURL}`);

                    if (response.status === 200) {
                        setLoading(false)
                        setBlogs(response.data.blogs);

                        if (response.data.blogs.length > 9) {
                            setShowMoreButton(true)
                        } else {
                            setShowMoreButton(false)
                        }
                    }
                } catch (error) {
                    setLoading(false);
                    console.log(error.message);
                }
            }
            fetchBlogPosts();
        }
    }, [location.search]);


    const submitHandle = (e) => {
        e.preventDefault();
        const URL = new URLSearchParams(location.search);
        URL.set('sort', formData?.sortblog);
        URL.set('searchBlog', formData.searchblog);
        URL.set('category', formData.blogcategory)


        const textUrl = URL.toString();
        navigate(`/search?${textUrl}`)

    }



    return (
        <>
            <div className="min-h-screen md:flex-row flex-col flex">

                {/* left screen  */}
                <div className="">
                    <form onSubmit={submitHandle} className={`border-r mt-10 shadow-sm md:w-64 w-full mb-5 md:mb-0 md:min-h-screen px-5 ${theme === 'dark' ? 'border-zinc-700' : 'border-zinc-200'}`}>

                        <div className="flex flex-col ">

                            <label className='text-sm font-semibold'>Search</label>
                            <input type="text" placeholder='Search blog..' className={`  py-2 text-sm rounded-md border outline-none mt-1 px-3 ${theme === 'dark' ? 'bg-gray-700 border-gray-500 focus:bg-gray-600' : 'bg-white border-gray-400 focus:bg-gray-50'}`} onChange={inputChangeHandle} name='searchblog' value={formData.searchblog} />


                            <label className='text-sm font-semibold mt-2 mb-1' >Sort</label>

                            <select
                                name="sortblog"

                                className={`px-5 py-2 border  rounded-md text-sm outline-none  ${theme === 'dark' ? 'bg-gray-700 border-gray-500 focus:bg-gray-600' : 'bg-white focus:bg-gray-50 border-gray-400'}`}

                                onChange={inputChangeHandle}
                                value={formData.sortblog}>
                                <option value="decs">Lastest</option>
                                <option value="asc">Oldest</option>
                            </select>

                            <label className='text-sm font-semibold mt-2 mb-1'>Category</label>
                            <select
                                name="blogcategory"

                                className={`px-5  py-2 rounded-md text-sm outline-none ${theme === 'dark' ? 'bg-gray-700 focus:bg-gray-600 border-gray-500' : 'bg-white border-gray-400 focus:bg-gray-50'}`}
                                onChange={inputChangeHandle}
                                value={formData.blogcategory} >

                                <option value="" disabled>Select category</option>
                                <option value="uncategorized">uncategorized</option>
                                <option value="Java">Java</option>
                                <option value="Javascript">JavaScript</option>
                                <option value="React.Js">React Js</option>
                                <option value="Git">Git</option>
                                <option value="MongoDB">MongoDB</option>
                            </select>
                        </div>

                        <div className="text-center mt-3">
                            <button type='submit' className='py-2 text-xs w-full rounded-sm  px-5 bg-gradient-to-r from-indigo-400 to-violet-500 text-white font-semibold'>Apply filters</button>
                        </div>
                    </form>
                </div>


                {/* right  screen*/}

                {
                    loading === true ? <blogLoader /> :

                        <div className="flex flex-wrap px-5 w-full my-10 gap-4 justify-center">


                            {
                                blogs.length > 0

                                    ?

                                    blogs && blogs.map((value, index) => {
                                        return (
                                            <div
                                                key={index}
                                                className={`shadow-md border hover:scale-[99%] duration-300 transition-all w-96 rounded-tl-xl rounded-br-xl pb-5 cursor-pointer ${theme === 'dark' ? 'border-gray-700' : 'border-gray-300'}`}>

                                                <Link to={`/blog/${value?.slug}`}>
                                                    <img src={value?.blogImgFile} className='duration-300 hover:scale-[99%] transition-all w-96 h-60 rounded-tl-xl rounded-br-xl' />

                                                    <div className="px-3">
                                                        <p className='text-lg md:text-xl'>{value?.blogTitle}</p>
                                                        <span className='text-xs md:text-sm w-20 text-center border px-4 rounded-full'>{value?.blogCategory}</span>
                                                    </div>
                                                </Link>
                                            </div>
                                        )
                                    })
                                    :

                                    <div className="w-full flex  flex-col items-center">
                                        <img src={NodataImg} className='w-96' />
                                        <h1 className='text-xl  font-bold'>Oops ! No blogs found</h1>
                                    </div>
                            }
                        </div>
                }

            </div>
        </>
    )
}

export default Search;