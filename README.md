# PDF Quiz Maker

A visually stunning quiz maker application that generates quizzes from PDF files using AI. This application allows users to upload PDF documents and create customized quizzes based on the content.

## Features

- **OpenAI Integration**: Uses the OpenAI API to generate intelligent quiz questions from PDF content
- **PDF Parsing**: Extracts text from PDF files for quiz generation
- **Customizable Quiz Settings**: Choose difficulty level, number of questions, and question types
- **Multiple Question Types**: Supports multiple-choice, true/false, and short-answer questions
- **Interactive Quiz Interface**: Modern and responsive UI for taking quizzes
- **Detailed Results**: View and analyze quiz performance with detailed explanations
- **Download Results**: Save quiz results for future reference

## Getting Started

### Prerequisites

- Node.js 18.0.0 or later
- An OpenAI API key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/pdf-quiz-maker.git
   cd pdf-quiz-maker
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## How to Use

1. **Enter your OpenAI API Key**: The application will prompt you to enter your OpenAI API key for authentication.

2. **Upload a PDF**: Upload a PDF document from which you want to generate quiz questions.

3. **Configure Quiz Settings**:
   - Select difficulty level (Easy, Medium, Hard)
   - Choose the number of questions (1-20)
   - Select question types (Multiple Choice, True/False, Short Answer)

4. **Generate and Take the Quiz**: The application will generate questions based on your PDF and settings.

5. **View Results**: After completing the quiz, you'll see detailed results including your score and explanations for each question.

## Technologies Used

- **Next.js**: React framework for building the application
- **TypeScript**: For type-safe code
- **Tailwind CSS**: For styling the UI
- **Framer Motion**: For animations
- **OpenAI API**: For generating quiz questions
- **pdf-parse**: For extracting text from PDF files
- **React Dropzone**: For file uploads
- **React Hook Form**: For form handling and validation

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- OpenAI for providing the API for quiz generation
- Next.js team for the amazing framework
- All the open-source libraries used in this project
