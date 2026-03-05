import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  scrapeTopClips,
  scrapeChannelHighlights,
  getJobs,
  getJobClips,
  deleteJob as deleteJobApi,
} from '../services/api';

export interface Clip {
  id: string;
  url: string;
  embed_url: string;
  title: string;
  creator_name: string;
  broadcaster_name: string;
  channel_name?: string;
  game_name: string;
  view_count: number;
  created_at: string;
  duration: number;
  thumbnail_url: string;
}

export interface Job {
  id: number;
  job_type: 'top_clips' | 'channel_highlights';
  config: any;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  result?: {
    total_clips: number;
    clips: Clip[];
    game_breakdown?: Record<string, number>;
    channels?: Record<string, number>;
  };
  error?: string;
  created_at: string;
  completed_at?: string;
}

interface ClipsState {
  jobs: Job[];
  currentClips: Clip[];
  favorites: Clip[];
  jobsLoading: boolean;
  clipsLoading: boolean;
  scraping: boolean;
  error: string | null;
  activeJobId: number | null;
}

const initialState: ClipsState = {
  jobs: [],
  currentClips: [],
  favorites: [],
  jobsLoading: false,
  clipsLoading: false,
  scraping: false,
  error: null,
  activeJobId: null,
};

// Async thunks
export const startTopClipsScrape = createAsyncThunk(
  'clips/startTopClipsScrape',
  async (config: { days_back: number; limit: number; english_only: boolean; game_filter?: string }, { rejectWithValue }) => {
    try {
      const data = await scrapeTopClips(config);
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || 'Failed to start scraping');
    }
  }
);

export const startHighlightsScrape = createAsyncThunk(
  'clips/startHighlightsScrape',
  async (config: { channels: string[]; days_back: number; clips_per_channel: number }, { rejectWithValue }) => {
    try {
      const data = await scrapeChannelHighlights(config);
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || 'Failed to start scraping');
    }
  }
);

export const fetchJobs = createAsyncThunk(
  'clips/fetchJobs',
  async (_, { rejectWithValue }) => {
    try {
      const data = await getJobs();
      return data.jobs;
    } catch (err: any) {
      return rejectWithValue('Failed to fetch jobs');
    }
  }
);

export const fetchJobClips = createAsyncThunk(
  'clips/fetchJobClips',
  async (jobId: number, { rejectWithValue }) => {
    try {
      const data = await getJobClips(jobId);
      return data.clips;
    } catch (err: any) {
      return rejectWithValue('Failed to fetch clips');
    }
  }
);

export const removeJob = createAsyncThunk(
  'clips/removeJob',
  async (jobId: number, { rejectWithValue }) => {
    try {
      await deleteJobApi(jobId);
      return jobId;
    } catch (err: any) {
      return rejectWithValue('Failed to delete job');
    }
  }
);

const clipsSlice = createSlice({
  name: 'clips',
  initialState,
  reducers: {
    setActiveJobId(state, action: PayloadAction<number | null>) {
      state.activeJobId = action.payload;
    },
    toggleFavorite(state, action: PayloadAction<Clip>) {
      const exists = state.favorites.find(c => c.id === action.payload.id);
      if (exists) {
        state.favorites = state.favorites.filter(c => c.id !== action.payload.id);
      } else {
        state.favorites.push(action.payload);
      }
    },
    setFavorites(state, action: PayloadAction<Clip[]>) {
      state.favorites = action.payload;
    },
    clearError(state) {
      state.error = null;
    },
    clearCurrentClips(state) {
      state.currentClips = [];
    },
    updateJobInList(state, action: PayloadAction<Job>) {
      const index = state.jobs.findIndex(j => j.id === action.payload.id);
      if (index !== -1) {
        state.jobs[index] = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    // Start scraping
    builder
      .addCase(startTopClipsScrape.pending, (state) => {
        state.scraping = true;
        state.error = null;
      })
      .addCase(startTopClipsScrape.fulfilled, (state, action) => {
        state.scraping = false;
        state.activeJobId = action.payload.job_id;
      })
      .addCase(startTopClipsScrape.rejected, (state, action) => {
        state.scraping = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(startHighlightsScrape.pending, (state) => {
        state.scraping = true;
        state.error = null;
      })
      .addCase(startHighlightsScrape.fulfilled, (state, action) => {
        state.scraping = false;
        state.activeJobId = action.payload.job_id;
      })
      .addCase(startHighlightsScrape.rejected, (state, action) => {
        state.scraping = false;
        state.error = action.payload as string;
      });

    // Fetch jobs
    builder
      .addCase(fetchJobs.pending, (state) => {
        state.jobsLoading = true;
      })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.jobsLoading = false;
        state.jobs = action.payload;
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.jobsLoading = false;
        state.error = action.payload as string;
      });

    // Fetch clips
    builder
      .addCase(fetchJobClips.pending, (state) => {
        state.clipsLoading = true;
      })
      .addCase(fetchJobClips.fulfilled, (state, action) => {
        state.clipsLoading = false;
        state.currentClips = action.payload;
      })
      .addCase(fetchJobClips.rejected, (state, action) => {
        state.clipsLoading = false;
        state.error = action.payload as string;
      });

    // Remove job
    builder.addCase(removeJob.fulfilled, (state, action) => {
      state.jobs = state.jobs.filter(j => j.id !== action.payload);
    });
  },
});

export const {
  setActiveJobId,
  toggleFavorite,
  setFavorites,
  clearError,
  clearCurrentClips,
  updateJobInList,
} = clipsSlice.actions;

export default clipsSlice.reducer;




