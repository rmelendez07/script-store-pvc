import readline from "readline";
import { printError } from "./print-information";

export const userQuestion = (
  question: string,
  handler?: (req: unknown) => void
) => {
    if(handler){
        const rl = readline.createInterface(process.stdin, process.stdout);
        rl.setPrompt(`${question}? `);
        rl.prompt();
      
        rl.on("line", (response) => {
        handler(response);
          rl.close();
        }); 
    } else {
        const rlYNQuestion = readline.createInterface(process.stdin, process.stdout);
        const YN = "(y/n)";
        let responseYN = "";
        rlYNQuestion.setPrompt(`${question}?${!handler ? YN : ""}: `);
        rlYNQuestion.prompt();

        rlYNQuestion.on("line", (response) => {
              responseYN = response.toLowerCase();
              if (!validateAnswer(responseYN)) {
                printError('Invalid answer, please answer with the following (y/n)');
                userQuestion(question);
              }
              rlYNQuestion.close();
          });
          return responseYN;  
    }
};

const validateAnswer = (responseYN: string): boolean => {
  return responseYN === "y" || responseYN === "n" ? true : false;
};
