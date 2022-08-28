import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fee, signAndBroadcastProto } from "../../txns/execute";
import { CreateGroup, CreateGroupWithPolicy } from "../../txns/proto";
import { setError, setTxHash } from "../common/commonSlice";
import groupService from "./groupService";

const initialState = {
  tx: {
    status: "idle",
    type: "",
  },
  groups: {
    admin: {
      list: [],
      pagination: {},
      status: "idle",
    },
    member: {
      list: [],
      pagination: {},
      status: "idle",
    },
  },
};

export const getGroupsByAdmin = createAsyncThunk(
  "group/group-by-admin",
  async (data) => {
    const response = await groupService.groupsByAdmin(
      data.baseURL,
      data.admin,
      data.pagination
    );
    return response.data;
  }
);

export const getGroupsByMember = createAsyncThunk(
  "group/group-by-member",
  async (data) => {
    const response = await groupService.groupsByMember(
      data.baseURL,
      data.address,
      data.pagination
    );
    return response.data;
  }
);

export const txCreateGroup = createAsyncThunk(
  "group/tx-create-group",
  async (data, { rejectWithValue, fulfillWithValue, dispatch }) => {
    let msg;
    try {
      if (data.members.length > 0) {
        if (data.decisionPolicy) {
          msg = CreateGroupWithPolicy(
            data.admin,
            data.groupMetadata,
            data.members,
            data.decisionPolicy,
            data.policyMetadata,
            data.policyAsAdmin
          );
        }
        msg = CreateGroup(data.admin, data.groupMetadata, data.members);
      } else {
        msg = CreateGroup(data.admin, data.groupMetadata, []);
      }
      const result = await signAndBroadcastProto(
        [msg],
        fee(data.denom, data.feeAmount, 260000),
        data.rpc
      );
      if (result?.code === 0) {
        dispatch(
          setTxHash({
            hash: result?.transactionHash,
          })
        );
        return fulfillWithValue({ txHash: result?.transactionHash });
      } else {
        dispatch(
          setError({
            type: "error",
            message: result?.rawLog,
          })
        );
        return rejectWithValue(result?.rawLog);
      }
    } catch (error) {
      dispatch(
        setError({
          type: "error",
          message: error.message,
        })
      );
      return rejectWithValue(error.message);
    }
  }
);

export const groupSlice = createSlice({
  name: "group",
  initialState,
  reducers: {
    resetTxType: (state, _) => {
      state.tx.type = "";
    },
  },
  // The `extraReducers` field lets the slice handle actions defined elsewhere,
  // including actions generated by createAsyncThunk or in other slices.
  extraReducers: (builder) => {
    builder
      .addCase(getGroupsByAdmin.pending, (state) => {
        state.groups.admin.list = [];
        state.groups.admin.status = "pending";
      })
      .addCase(getGroupsByAdmin.fulfilled, (state, action) => {
        state.groups.admin.list = action.payload.groups;
        state.groups.admin.pagination = action.payload.pagination;
        state.groups.admin.status = "idle";
      })
      .addCase(getGroupsByAdmin.rejected, (state, action) => {
        state.groups.admin.status = "idle";
        console.log(action.error);
        // TODO: handle error
      });

    builder
      .addCase(getGroupsByMember.pending, (state) => {
        state.groups.member.status = "pending";
        state.groups.member.list = [];
      })
      .addCase(getGroupsByMember.fulfilled, (state, action) => {
        state.groups.member.list = action.payload.groups;
        state.groups.member.pagination = action.payload.pagination;
        state.groups.member.status = "idle";
      })
      .addCase(getGroupsByMember.rejected, (state, action) => {
        console.log(action.error);
        state.groups.member.status = "idle";
        // TODO: handle error
      });

    builder
      .addCase(txCreateGroup.pending, (state) => {
        state.tx.status = `pending`;
      })
      .addCase(txCreateGroup.fulfilled, (state, _) => {
        state.tx.status = `idle`;
      })
      .addCase(txCreateGroup.rejected, (state, _) => {
        state.tx.status = `rejected`;
      });
  },
});

export default groupSlice.reducer;