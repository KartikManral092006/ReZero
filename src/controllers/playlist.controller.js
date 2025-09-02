import {db} from "../libs/db.js"

export const getAllPlaylistDetails = async(req,res)=>{
    try {
        const userId = req.user.id
        const playlists = await db.playlist.findMany({
            where:{
                userId
            } ,
            include:{
                problems:{
                    include:{problem:true}
                }
            }
        })

        res.status(200).json({
            success:true,
            message:"Playlist fetched successfully",
            playlists
        })
    } catch (error) {
        console.error("Error fetching playlist:", error);
        res.status(500).json({
            error:"Failed to fetch playlist",
        })
    }

}

export const getPlaylistDetail = async(req,res)=>{
    try {
        const userId = req.user.id
        const {playlistId}= req.params

        const playlist = await db.playlist.findUnique({
            where:{
                id:playlistId,
                userId
            },
            include:{
                problems:{
                    include:{
                        problem:true}
                    }
                }
            })

            if(!playlist){
                return res.status(404).json({
                    error:"Playlist not found!",
                })
            }
            res.status(200).json({
                success:true,
                message:"Playlist fetched successfully",
                playlist
            })
    } catch (error) {
        console.log("Error fetching playlist:", error);
        res.status(500).json({
            error:"Failed to fetch playlist",
        })
    };


}

export const createPlaylist = async(req,res)=>{
    try {
        const {name , description} =req.body
        const userId = req.user.id
        const playlist = await db.playlist.create({
            data:{
                name,
                description,
                userId
            }
        })

        res.status(200).json({
            success:true,
            message:"Playlist created successfully",
            playlist
        })
    } catch (error) {
        console.log("Error creating playlist:", error);
        res.status(500).json({
            error:"Failed to create playlist",
        })
    }

}

export const addProblemToPlaylist = async(req,res)=>{
    
}

export const deletePlaylist = async(req,res)=>{}

export const removeProblemByPlaylistId = async(req,res)=>{}

export const updatePlaylist = async(req,res)=>{}
