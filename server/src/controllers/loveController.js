const Response = require('../models/Response');
const prompts = require('../data/prompts');
const lyrics = require('../data/lyrics');

const getPrompts = (req, res) => {
  res.json({
    prompts,
    funFacts: [
      'You make my heart do the Macarena.',
      'Scientifically proven: saying yes boosts serotonin by 3000%.',
      'Side effects of loving me include spontaneous laughter.',
    ],
  });
};

const getRandomDare = (req, res) => {
  const dare =
    prompts.dares[Math.floor(Math.random() * prompts.dares.length)];
  res.json({ dare });
};

const createResponse = async (req, res, next) => {
  try {
    const { answer = 'yes', note } = req.body;
    const normalizedAnswer = String(answer).toLowerCase();
    if (!['yes', 'no', 'maybe'].includes(normalizedAnswer)) {
      return res.status(400).json({ message: 'Answer must be yes, no, or maybe' });
    }
    const response = await Response.create({
      answer: normalizedAnswer,
      note: note || '',
      prompt: prompts.question.title,
    });

    res.status(201).json({ response });
  } catch (error) {
    next(error);
  }
};

const getLatestResponses = async (req, res, next) => {
  try {
    const responses = await Response.find().sort({ createdAt: -1 }).limit(10);
    res.json({ responses });
  } catch (error) {
    next(error);
  }
};

const getLyrics = (req, res) => {
  const songLyrics = lyrics['neighborhood-reflection'] || [];
  res.json({ lyrics: songLyrics });
};

module.exports = {
  getPrompts,
  getRandomDare,
  createResponse,
  getLatestResponses,
  getLyrics,
};

