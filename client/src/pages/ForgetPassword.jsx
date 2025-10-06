import React, { useState } from 'react'
import resetPasswordImg from '../assests/reset.png';
import { useSelector } from 'react-redux';
import { FaLink } from "react-icons/fa6";
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast'

const ForgetPassword = () => {

    const { theme } = useSelector((state) => state.themeSliceApp);
    const { user } = useSelector((state) => state.userSliceApp);
    console.log('The user is : ', user);
    const [userEmail, setUserEmail] = useState('');



    const sendResetPasswordLink = async () => {

        try {
            const response = await axios.post(`/api/user/reset-password`, { email: userEmail });

            if (response.status === 200) {
                console.log(response.data);
            }
        } catch (error) {
            toast.error(error.response.data.message)
        }
    }

    const inputChangeHandle = (e) => {
        const { value } = e.target;
        setUserEmail(value)
    }

    const formVlidate = (emailVal) => {

        const regEx = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/

        if (!emailVal) {
            toast.error('Email field is empty!')
            return false;
        }

        if (!regEx.test(emailVal)) {
            toast.error('Please enter a valid email')
            return false
        } else {
            console.log('running');
            sendResetPasswordLink();
        }
    }

    const submitHandler = (e) => {
        e.preventDefault()
        formVlidate(userEmail)
    }





    return (
        <>
            <div className="min-h-screen mt-10 md:mt-0 w-full flex flex-wrap flex-col md:flex-row  items-center md:justify-center gap-5">

                {/* Left  */}
                <div className="left">
                    <img src={resetPasswordImg} alt="" className='md:w-[500px]' />
                </div>

                {/* Right  */}
                <div className=" px-5 md:px-0  md:w-1/4  w-full">
                    <form action="" className='flex flex-col gap-5'>
                        <div className="flex gap-5  justify-center">
                            <span>
                                <FaLink size={27} color='teal' />
                            </span>
                            <span>
                                <h1 className='mb-5 text-xl text-teal-600 text-center'>Send reset password link</h1>
                            </span>
                        </div>

                        <input type="email" placeholder='Email*' className={`py-2 px-3 rounded-md outline-none   ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} `} autoComplete='off' value={userEmail} onChange={inputChangeHandle} name='email' />

                        <button className='bg-teal-600 py-2 rounded-md active:bg-teal-700 transition-all' onClick={submitHandler}>Submit</button>

                    </form>
                </div>
            </div>
            <Toaster />
        </>
    )
}

export default ForgetPassword