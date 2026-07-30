const Exercise = require('../models/Exercise')

const CATEGORIES = ['Strength', 'Cardio', 'Flexibility', 'Balance', 'Core']
const MUSCLE_GROUPS = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Full Body']
const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced']

const listExercises = async (req, res, next) => {
  try {
    const { search = '', category = '', muscleGroup = '', difficulty = '', status = '' } = req.query
    const query = { trainer: req.user._id }
    if (search) query.name = { $regex: search, $options: 'i' }
    if (category) query.category = category
    if (muscleGroup) query.muscleGroup = muscleGroup
    if (difficulty) query.difficulty = difficulty
    if (status) query.status = status

    const exercises = await Exercise.find(query).sort({ createdAt: -1 })
    res.json({ data: exercises, categories: CATEGORIES, muscleGroups: MUSCLE_GROUPS, difficulties: DIFFICULTIES })
  } catch (error) {
    next(error)
  }
}

const getExercise = async (req, res, next) => {
  try {
    const exercise = await Exercise.findOne({ _id: req.params.id, trainer: req.user._id })
    if (!exercise) {
      res.status(404)
      throw new Error('Exercise not found')
    }
    res.json(exercise)
  } catch (error) {
    next(error)
  }
}

const createExercise = async (req, res, next) => {
  try {
    const { name, category, muscleGroup, difficulty, sets, reps, duration, video, image, description, status } = req.body

    if (!name || !category || !muscleGroup) {
      res.status(400)
      throw new Error('Name, category and muscle group are required')
    }

    const exercise = await Exercise.create({
      trainer: req.user._id,
      name,
      category,
      muscleGroup,
      difficulty,
      sets: sets || null,
      reps: reps || null,
      duration: duration || null,
      video,
      image,
      description,
      status,
    })

    res.status(201).json(exercise)
  } catch (error) {
    next(error)
  }
}

const updateExercise = async (req, res, next) => {
  try {
    const exercise = await Exercise.findOne({ _id: req.params.id, trainer: req.user._id })
    if (!exercise) {
      res.status(404)
      throw new Error('Exercise not found')
    }

    const { name, category, muscleGroup, difficulty, sets, reps, duration, video, image, description, status } = req.body
    if (name) exercise.name = name
    if (category) exercise.category = category
    if (muscleGroup) exercise.muscleGroup = muscleGroup
    if (difficulty) exercise.difficulty = difficulty
    if (sets !== undefined) exercise.sets = sets || null
    if (reps !== undefined) exercise.reps = reps || null
    if (duration !== undefined) exercise.duration = duration || null
    if (video !== undefined) exercise.video = video
    if (image !== undefined) exercise.image = image
    if (description !== undefined) exercise.description = description
    if (status) exercise.status = status

    await exercise.save()
    res.json(exercise)
  } catch (error) {
    next(error)
  }
}

const deleteExercise = async (req, res, next) => {
  try {
    const exercise = await Exercise.findOneAndDelete({ _id: req.params.id, trainer: req.user._id })
    if (!exercise) {
      res.status(404)
      throw new Error('Exercise not found')
    }
    res.json({ message: 'Exercise deleted' })
  } catch (error) {
    next(error)
  }
}

module.exports = { listExercises, getExercise, createExercise, updateExercise, deleteExercise }
