import { createSlice } from '@reduxjs/toolkit';



const blogSlice = createSlice({
    name: 'blogSlice',

    initialState: {
        isLoading: false,
        blogs: null,
        error: null
    },
    reducers: {
        addBlogStart: (state) => {
            state.isLoading = true;
        },
        addBlogSuccess: (state, action) => {
            state.blogs = action.payload;
            state.isLoading = false;
        },
        addBlogFailure: (state, action) => {
            state.isLoading = false;
            state.error = action.payload
        },


        // Update blog :
        updateBlogStart: (state) => {
            state.isLoading = true
        },
        updateBlogSuccess: (state, action) => {
            state.blogs = action.payload
            state.isLoading = false
        },
        updateBlogFailure: (state, action) => {
            state.error = action.payload
        }
    }
});


export const { addBlogStart, addBlogSuccess, addBlogFailure, updateBlogStart, updateBlogSuccess, updateBlogFailure } = blogSlice.actions;
export default blogSlice.reducer;
