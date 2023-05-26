
const Queue = require("../models/queue");


const getAll = async (req, res) => {
  try {
    let messages = await Queue.find();
    res.status(200).json({
      messages: messages,
    })
  } catch (error) {
    console.log("Error during get all:", error);
    res.status(500).json({
      error: "Error",
      messages: [],
    })
  }
}

const dequeue = async (req, res) => {
  try {
    const oldest = await Queue.findOneAndDelete().sort('createdAt');
    const isEmpty = await Queue.countDocuments() === 0;

    if (oldest) {
      console.log("Message dequeued:", oldest.mongoReference)
      res.status(200).json({
        message: oldest.mongoReference,
        isEmpty: isEmpty,
      })
    } else {
      console.log("Queue is empty");
      res.status(200).json({
        message: "Queue is empty",
        isEmpty: isEmpty,
      })
    }
  } catch (error) {
    console.log("Error during dequeue:", error);

    res.status(500).json({
      error: "Failed to dequeue",
      isEmpty: false,
    })
  }
}

module.exports = {
  getAll,
  dequeue
};
