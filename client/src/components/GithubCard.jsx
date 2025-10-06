import React from 'react'
import { FaGithub } from "react-icons/fa";
import allCompImg from '../assests/allComponent.png';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';



const GithubCard = () => {


    const { theme } = useSelector((state) => state.themeSliceApp);










    return (
        <>

            <div className={`my-10 border-2 w-80 md:w-auto rounded-tl-3xl rounded-br-3xl px-5 py-2 md:py-5 flex md:flex-row flex-col items-center md:gap-5 gap-10 justify-center ${theme === 'dark' ? 'shadow-2xl border-gray-600' : 'border-gray-300 shadow-xl'} `}>
                {/* Left Content s */}
                <div className="flex  flex-col gap-5 justify-start">
                    <h1 className='md:text-xl text-sm md:font-semibold font-bold'>Want to see more repository that I have worked on ?</h1>
                    <p className='text-xs md:text-base'>Click below button to checkout more resources</p>

                    <div className="">

                        <button className='font-semibold py-1 bg-violet-500 w-full rounded-md flex items-center gap-2 text-center justify-center hover:bg-violet-700 transition-all'>
                            <FaGithub size={25} />
                            <Link to={'https://github.com/Rakesh-99?tab=repositories'}>FIND MORE REPOSITORIES</Link>
                        </button>
                    </div>
                </div>

                {/* Right content  */}
                <div className="">
                    <div className="">
                        <img src={allCompImg} alt="" className='w-80 md:h-48 h-32 object-cover ' />
                    </div>
                </div>
            </div >
        </>
    )
}

export default GithubCard