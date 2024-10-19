// triviaQuiz.js
const questions = [
    {
      question: "What is the most common renewable energy source?",
      options: ["Solar", "Wind", "Hydro", "Geothermal"],
      answer: "Solar",
    },
    {
      question: "Which gas is primarily responsible for climate change?",
      options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Hydrogen"],
      answer: "Carbon Dioxide",
    },
    {
      question: "What percentage of the Earth's surface is covered by water?",
      options: ["50%", "70%", "30%", "90%"],
      answer: "70%",
    },
    {
      question: "Which country is the largest producer of wind energy?",
      options: ["USA", "China", "Germany", "India"],
      answer: "China",
    },
    {
      question: "What is the purpose of recycling?",
      options: [
        "To create more waste",
        "To save energy and resources",
        "To make things more expensive",
        "To pollute the environment",
      ],
      answer: "To save energy and resources",
    },
  ];
  
  // Function to start the trivia quiz
  async function startTrivia(chatId, bot) {
    const randomIndex = Math.floor(Math.random() * questions.length);
    const question = questions[randomIndex];
  
    const optionsText = question.options
      .map((option, index) => `${index + 1}. ${option}`)
      .join("\n");
  
    await bot.sendMessage(chatId, `${question.question}\n\n${optionsText}`);
    
    return question.answer; // Return the correct answer for validation
  }
  
  // Function to handle answer validation
  async function validateAnswer(chatId, userAnswer, correctAnswer, bot) {
    if (userAnswer.toLowerCase() === correctAnswer.toLowerCase()) {
      await bot.sendMessage(chatId, "Correct! 🎉 You've earned 5 points.");
      // Here, you can also add points to the user in the database
    } else {
      await bot.sendMessage(chatId, `Wrong! The correct answer was: ${correctAnswer}.`);
    }
  }
  
  module.exports = { startTrivia, validateAnswer };
  