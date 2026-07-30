const ExerciseVideo = require('../models/ExerciseVideo')

const listVideos = async (req, res, next) => {
  try {
    const { search = '' } = req.query
    const query = { trainer: req.user._id }
    if (search) query.title = { $regex: search, $options: 'i' }

    const videos = await ExerciseVideo.find(query).sort({ createdAt: -1 })
    res.json(videos)
  } catch (error) {
    next(error)
  }
}

const createVideo = async (req, res, next) => {
  try {
    const { title, description, url, category } = req.body

    if (!title || !url) {
      res.status(400)
      throw new Error('Title and URL are required')
    }

    const video = await ExerciseVideo.create({ trainer: req.user._id, title, description, url, category })
    res.status(201).json(video)
  } catch (error) {
    next(error)
  }
}

const updateVideo = async (req, res, next) => {
  try {
    const video = await ExerciseVideo.findOne({ _id: req.params.id, trainer: req.user._id })
    if (!video) {
      res.status(404)
      throw new Error('Video not found')
    }

    const { title, description, url, category } = req.body
    if (title) video.title = title
    if (description !== undefined) video.description = description
    if (url) video.url = url
    if (category) video.category = category

    await video.save()
    res.json(video)
  } catch (error) {
    next(error)
  }
}

const deleteVideo = async (req, res, next) => {
  try {
    const video = await ExerciseVideo.findOneAndDelete({ _id: req.params.id, trainer: req.user._id })
    if (!video) {
      res.status(404)
      throw new Error('Video not found')
    }
    res.json({ message: 'Video deleted' })
  } catch (error) {
    next(error)
  }
}

module.exports = { listVideos, createVideo, updateVideo, deleteVideo }
