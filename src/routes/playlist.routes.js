import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import{
    getAllPlaylistDetails,
    getPlaylistDetail,
    createPlaylist,
    addProblemToPlaylist,
    deletePlaylist,
    removeProblemByPlaylistId,
    updatePlaylist
}from  "../controllers/playlist.controller.js"


const playlistRoute = express.Router();

playlistRoute.get('/',authMiddleware,getAllPlaylistDetails)

playlistRoute.get('/get-playlist/:playlistId',authMiddleware,getPlaylistDetail);

playlistRoute.post('/create-playlist',authMiddleware,createPlaylist);

playlistRoute.post('/:playlistId/add-problem',authMiddleware,addProblemToPlaylist);

playlistRoute.delete('/delete-playlist/:playlistId',authMiddleware,deletePlaylist);

playlistRoute.delete('/:playlistId/remove-problem',authMiddleware,removeProblemByPlaylistId);

playlistRoute.put('/update-playlist/:playlistId',authMiddleware,updatePlaylist);


export default playlistRoute;
