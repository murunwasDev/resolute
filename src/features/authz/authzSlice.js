import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import authzService from './authzService';

const initialState = {
  grantsToMe: {
    status: 'idle',
    errMsg: '',
    grants: [],
    pagination: {}
  },
  grantsByMe: {
    status: 'idle',
    errMsg: '',
    grants: [],
    pagination: {}
  },
};

export const getGrantsToMe = createAsyncThunk(
  'authz/grantsToMe',
  async (data) => {
    const response = await authzService.grantsToMe(data.baseURL, data.grantee, data.pagination);
    return response.data;
  }
);

export const getGrantsByMe = createAsyncThunk(
  'authz/grantsByMe',
  async (data) => {
    const response = await authzService.grantsByMe(data.baseURL, data.granter, data.pagination);
    return response.data;
  }
);

export const authzSlice = createSlice({
  name: 'authz',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getGrantsToMe.pending, (state) => {
        state.grantsToMe.status = 'loading';
        state.grantsToMe.errMsg = ''

      })
      .addCase(getGrantsToMe.fulfilled, (state, action) => {

        state.grantsToMe.status = 'idle';
        state.grantsToMe.grants = action.payload.grants
        state.grantsToMe.pagination = action.payload.pagination
        state.grantsToMe.errMsg = ''
      })
      .addCase(getGrantsToMe.rejected, (state, action) => {
        state.grantsToMe.status = 'rejected';
        state.grantsToMe.errMsg = action.error.message
      })

    builder
      .addCase(getGrantsByMe.pending, (state) => {
        state.grantsByMe.status = 'loading';
        state.grantsByMe.errMsg = ''

      })
      .addCase(getGrantsByMe.fulfilled, (state, action) => {
        state.grantsByMe.status = 'idle';
        state.grantsByMe.grants = action.payload.grants
        state.grantsByMe.pagination = action.payload.pagination
        state.grantsByMe.errMsg = ''
      })
      .addCase(getGrantsByMe.rejected, (state, action) => {
        state.grantsByMe.status = 'rejected';
        state.grantsByMe.errMsg = action.error.message
      })
  },
});

export default authzSlice.reducer;
