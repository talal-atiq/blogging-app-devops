import { createSlice } from '@reduxjs/toolkit';


const userSlice = createSlice({

    name: 'userSlice',

    initialState: {
        user: null,
        error: null,
        isLoading: false
    },
    reducers: {

        // Login User : 
        
        loginStart: (state) => {
            state.isLoading = true;
        },
        loginSuccess: (state, action) => {
            state.isLoading = false;
            state.user = action.payload;
        },
        loginFailure: (state, action) => {
            state.isLoading = false;
            state.error = action.payload
        },

        // Update User :

        userUpdateStart: (state) => {
            state.isLoading = true;
        },
        userUpdateSuccess: (state, action) => {
            state.isLoading = false;
            state.user = action.payload;

        },
        userUpdateFailure: (state, action) => {
            state.isLoading = false;
            state.error = action.payload;
        },

        // Delete User : 

        deleteUserStart: (state) => {
            state.isLoading = true;
        },
        deleteUserSuccess: (state, action) => {
            state.isLoading = false;
            state.user = action.payload;
        },
        deleteUserFailure: (state, action) => {
            state.isLoading = false;
            state.error = action.payload
        },

        // SignOut User : 

        signOutSuccess: (state) => {
            state.user = null;
            state.isLoading = false;
        },
        signOutUserFailure: (state, action) => {
            state.isLoading = false
            state.error = action.payload;
        }
    }
});

export const { loginStart, loginSuccess, loginFailure, userUpdateStart, userUpdateSuccess, userUpdateFailure, deleteUserStart, deleteUserSuccess, deleteUserFailure, signOutSuccess, signOutUserFailure } = userSlice.actions;
export default userSlice.reducer;