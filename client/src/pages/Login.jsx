import { FcGoogle } from "react-icons/fc";
import loginImg from '../assests/loginImg.png';
import { TiUserAdd } from "react-icons/ti";
import { useState, useSyncExternalStore } from "react";
import toast, { Toaster } from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { useNavigate, NavLink } from 'react-router-dom';
import { FaUserCog } from "react-icons/fa";
import Spinner from "../assests/spinner/Spinner";
import { loginStart, loginSuccess, loginFailure } from "../features/userSlice";
import { useSelector } from 'react-redux';
import OAuth from "../components/OAuth";

const Login = () => {

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { isLoading } = useSelector((state) => state.userSliceApp);

    const { theme } = useSelector((state) => state.themeSliceApp);







    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });


    const submitHandle = (e) => {
        e.preventDefault();
        validateForm(formData)
    };

    const onInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };


    const validateForm = async (formData) => {
        const regEx = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/

        if (!formData.email) {
            toast.error('Email can not be empty!');
            return false;
        } else if (!regEx.test(formData.email)) {
            toast.error('Please enter a valid email!');
            return false;
        } else if (!formData.password) {
            toast.error('Password can not empty!');
            return false;
        } else if (formData.password.length < 6) {
            toast.error('Password can not be less than 6 char!');
            return false;
        } else {

            // Performing Login Api Call 

            try {
                dispatch(loginStart());

                const loginUser = await axios.post(`/api/user/login`, formData);
                const response = loginUser.data.user;
                dispatch(loginSuccess(response));
                navigate('/');

            } catch (error) {
                dispatch(loginFailure(error.response.data));
                toast.error(error.response.data.message);
            }
        }
    };



    return (
        <>
            <div className="md:flex-row flex-col flex md:gap-10  items-center md:justify-center min-h-screen ">

                {/* Left Content  */}
                <div className="md:w-1/3 w-80">
                    <img src={loginImg} alt="loginImg" className="" />
                </div>



                {/* Right Content : */}
                <form className="md:w-1/3 w-80 flex flex-col gap-2" onSubmit={submitHandle}>


                    <div className="flex items-center justify-center gap-3">
                        <span className="border-2 border-blue-400 rounded-full py-2 px-2">
                            <FaUserCog className="text-blue-400" size={25} />
                        </span>
                        <h1 className="text-center md:text-4xl  text-2xl text-blue-400 font-semibold">Sign in </h1>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className='flex '>Email <span className='font-semibold text-red-400 text-xl'>*</span></label>
                        <input type="email" name="email" placeholder="youremail@gmail.com" className={`border outline-none  rounded-md py-2 px-3 bg-blue-50 border-blue-400 ${theme === 'dark' && 'bg-gray-700 text-gray-100 focus:bg-gray-800 transition-all'}`} value={formData.email} onChange={onInputChange} autoComplete="off" />
                    </div>


                    <div className="flex flex-col gap-1">
                        <label className='flex '>Password <span className='font-semibold text-red-400 text-xl'>*</span></label>
                        <input type="password" name="password" placeholder="Password" className={`border outline-none rounded-md py-2 px-3 border-blue-400 bg-blue-50 ${theme === 'dark' && 'bg-gray-700 focus:bg-gray-800 text-gray-100'}`} value={formData.password} onChange={onInputChange} />
                    </div>


                    <div className="w-full">
                        <button disabled={isLoading} type="submit" className="bg-blue-500 text-white font-semibold rounded-md w-full py-2 my-4 active:bg-blue-600 transition-all">
                            {
                                isLoading ? <div className="flex justify-center items-center"><Spinner /></div> : <span>Login</span>
                            }
                        </button>
                    </div>

                    <div className="text-sm">
                        <span>Forget Password ? </span>
                        <NavLink to={'/forget-password'} className="text-blue-500 hover:underline cursor-pointer">Click</NavLink>
                    </div>

                    <hr />


                    <div className="text-sm">
                        <span>Don't have an account ? </span>
                        <NavLink className="text-blue-500 hover:underline cursor-pointer" to={'/register'}>Register</NavLink>
                    </div>

                </form>
            </div>
            <Toaster />
        </>
    )
}
export default Login;