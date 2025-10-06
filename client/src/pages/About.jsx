import aboutImage from '../assests/About.png';
import { motion } from 'framer-motion';
import sideImg from '../assests/boyPointing.png';
import GithubCalenderFunc from '../components/GithubCalender';


const About = () => {



    return (
        <>
            {/* First Section  */}
            <div className="min-h-screen flex flex-col items-center justify-center w-full">
                <div className="flex w-full relative justify-start md:pl-20 ">
                    <motion.img src={aboutImage} alt="" className='rounded-full w-60 md:w-80 relative '
                        initial={{ x: -10 }}
                        animate={{ x: 10 }}
                        transition={{
                            duration: 1,
                            delay: 0
                        }}
                    />

                    <h1 className='absolute flex-col top-20 md:ml-20 text-sm md:text-4xl md:left-80 left-52 flex gap-2 '
                    >Hi, I am <motion.span className='bg-indigo-600 font-semibold py-1 text-xs md:text-4xl rounded-md  px-2'

                        initial={{ x: 30 }}
                        animate={{ x: 10 }}
                        transition={{
                            duration: 1,
                            delay: 0
                        }}

                    >Talal Atiq.</motion.span>
                        <span>Nice to meet you.</span>
                    </h1>
                </div>


                {/* Second Section  */}
                <div className="flex min-h-screen w-full px-0 md:px-20 my-10">
                    <span className='text-sm md:text-base leading-7 px-5  text-justify md:w-2/3'>
                        This website lets you read, explore, comment, and interact with your favorite bloggers, creating a space where ideas and conversations come to life. The website is made using <span className='font-semibold text-teal-400 '>HTML</span>, <span className='font-semibold text-teal-400 '>CSS</span> , <span className='font-semibold text-teal-400 '>JavaScript</span>, <span className='font-semibold text-teal-400 '>TailwindCss</span>, <span className='font-semibold text-teal-400 '>React Js</span>, <span className='font-semibold text-teal-400 '>Redux Toolkit</span>, and <span className='font-semibold text-teal-400 '>Framer Motion</span>.  <span className='font-semibold text-teal-400 '>Node.js</span>  <span className='font-semibold text-teal-400 '></span> <span className='font-semibold text-teal-400 '></span>.<span className='font-semibold text-teal-400 '></span> <span className='font-semibold text-teal-400 '></span><span className='font-semibold text-teal-400 '></span>. <span className='font-semibold text-teal-400 '></span><span className='font-semibold text-teal-400 '></span> <span className='font-semibold text-teal-400 '></span>


                        <div className="my-10 flex justify-center ">
                            <GithubCalenderFunc />
                        </div>
                    </span>

                    <div className="">
                        <motion.img src={sideImg} alt="" className='w-80 md:block hidden'

                            initial={{ x: 100 }}
                            animate={{ x: 10 }}
                            transition={{
                                duration: 1,
                                delay: 0
                            }}
                        />
                    </div>
                </div>

            </div>
        </>
    )
}
export default About;