import { useEffect, useRef, useState } from 'react';
import updateUserImg from '../assests/updateUserImg.png';
import { LiaUserEditSolid } from "react-icons/lia";
import { useSelector, useDispatch } from 'react-redux';
import { firebaseStorage } from '../firebase/firebaseConfig';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';
import { userUpdateStart, userUpdateSuccess, userUpdateFailure, signOutSuccess, signOutUserFailure } from '../features/userSlice';
import CircleSpinner from '../assests/circleSpinner/CircleSpinner.jsx';
import Modal from './Modal.jsx';
import { NavLink } from 'react-router-dom'






const DashboardProfile = () => {


    const { user } = useSelector((state) => state.userSliceApp);
    const { theme } = useSelector((state) => state.themeSliceApp);

    const filePickerRef = useRef();

    const [tempFileUrl, setTempFileUrl] = useState(null);

    const [imageFile, setImageFile] = useState(null);

    const [firebaseImgURL, setFirebaseImgURL] = useState(null);

    const [imageLoader, setImageLoader] = useState(false);

    const [formData, setFormData] = useState({});

    const dispatch = useDispatch();

    const [showModal, setShowModal] = useState(false);


    const inputFileChange = (e) => {
        const file = e.target.files[0];

        if (file) {
            setImageFile(file)
            setTempFileUrl(URL.createObjectURL(file));
        }
    }

    useEffect(() => {
        if (imageFile) {
            uploadImage()
        }
    }, [imageFile])


    const uploadImage = async () => {

        const uniqueProfileImage = `image_${Date.now().toString()}`;

        const imageRef = ref(firebaseStorage, `profilePictures/${uniqueProfileImage}`, imageFile);

        try {
            setImageLoader(true);

            const upload = await uploadBytes(imageRef, imageFile);

            const getFirebaseImgUrl = await getDownloadURL(upload.ref);
            setImageLoader(false);

            setFirebaseImgURL(getFirebaseImgUrl);
            setFormData({ ...formData, profilePicture: getFirebaseImgUrl })

            toast.success('Profile picture has been updated')

        } catch (error) {
            setImageLoader(false);
            console.log(error);
        }
    }

    const inputInfoChange = (e) => {
        const { name, value } = e.target;

        setFormData({ ...formData, [name]: value });
    }


    const submitHandle = async (e) => {
        e.preventDefault();

        if (Object.keys(formData).length === 0) {
            toast.error('No changes made !')
            return false
        }


        try {

            // UpdateUser profile Api 

            dispatch(userUpdateStart());
            const updateUser = await axios.put(`/api/user/updateuser/${user._id}`, formData, {
                headers: {
                    Authorization: user.token
                }
            });

            if (updateUser.status === 200) {
                dispatch(userUpdateSuccess(updateUser.data.user));
                toast.success('User profile has been updated')
            }

        } catch (error) {
            dispatch(userUpdateFailure(error.response.data.message))
            toast.error(error.response.data.message);
            console.log(error);
        }
    };


    const deleteHandle = () => {
        setShowModal(true);
    }


    const signOutHandle = async () => {

        try {
            const signOutUser = await axios.post(`/api/user/signoutuser`);

            if (signOutUser.data.success === true) {
                dispatch(signOutSuccess())
            }

        } catch (error) {
            dispatch(signOutUserFailure(error.message));
            toast.error(error.message);
        }
    }










    return (
        <>
            <div className="flex flex-col md:flex-row md:justify-center min-h-screen items-center md:gap-10  w-full md:pt-0">

                {/* Left Side content  */}
                <div className="md:w-2/5 w-80 md:pt-20 flex items-center">
                    <img src={updateUserImg} alt="" className='w-full ' />
                </div>


                {/* Right Side Content  */}
                <div className="">
                    <div className=' flex justify-center items-center gap-4'>
                        <span className='border-2 border-violet-500 rounded-full py-1 px-1'><LiaUserEditSolid size={25} className='text-violet-400' /></span>
                        <h1 className='text-2xl text-violet-400'>Update User</h1>
                    </div>

                    <form className='flex flex-col items-center' onSubmit={submitHandle}>

                        <input type="file" ref={filePickerRef} className='hidden' accept='image/*' onChange={inputFileChange} />

                        <div className="w-16 rounded-full h-16 cursor-pointer overflow-hidden my-5 " onClick={() => filePickerRef.current.click()}>
                            {
                                imageLoader
                                    ?
                                    <div className="flex items-center flex-col justify-center w-full">
                                        <CircleSpinner />
                                    </div>
                                    :
                                    <div className="flex justify-center items-center">
                                        <img src={tempFileUrl || user.profilePicture} alt="userImg" />
                                    </div>
                            }
                        </div>


                        <div className="flex flex-col gap-4">

                            <input type="text" placeholder="Update username" className={`md:w-96 w-80 rounded-md py-2 px-3 outline-none border border-violet-500 text-black 
                            
                            ${theme === 'dark' && 'bg-gray-700 text-gray-100'}

                            `} name='username' onChange={inputInfoChange} defaultValue={user.username} />

                            <input type="email" placeholder="Update email" className={`md:w-96 w-80 rounded-md py-2 px-3 outline-none border border-violet-500 text-black
                            
                            ${theme === 'dark' && 'bg-gray-700 text-gray-100'}

                            
                            `} name='email' onChange={inputInfoChange} defaultValue={user.email} />

                            <input type="password" placeholder="Update password" className={`md:w-96 w-80 rounded-md py-2 px-3 outline-none border border-violet-500 text-black
                            
                            ${theme === 'dark' && 'bg-gray-700 text-gray-100'}
                            
                            `} name='password' onChange={inputInfoChange} defaultValue={user.password} />
                        </div>

                        <div className="">
                            <button type='submit' className="py-2  md:w-96 w-80 border border-violet-400 font-semibold my-4 rounded-md active:scale-95 transition-all hover:bg-violet-500">Update</button>

                            <div className="text-red-500 text-sm w-full flex justify-between">
                                <span className='cursor-pointer font-semibold' onClick={deleteHandle}>Delete User</span>
                                <span className='cursor-pointer font-semibold' onClick={signOutHandle}>Sign out</span>
                            </div>


                            {
                                user && user.isAdmin &&

                                <button type='button' className={` md:w-96 w-80 py-2 my-4 rounded-md active:scale-95 transition-all border border-green-500 hover:bg-green-600 hover:text-white`}>
                                    <NavLink to={'/create-blog'} className='font-semibold '>Create Blog</NavLink>
                                </button>
                            }



                        </div>

                    </form>
                </div >
                {
                    showModal && <Modal setShowModal={setShowModal} user={user} />
                }
                <Toaster />
            </div >
        </>
    )
}
export default DashboardProfile;