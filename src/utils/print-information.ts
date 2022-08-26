const printSeparator = (isBegining = true): void => {
  console.log(
    isBegining
      ? "------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------"
      : "------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------\n"
  );
};

const printInformation = (message: string): void => {
    console.log(`\nInformation: ${message}.`);
}

const printSuccess = (message: string): void => {
    console.log('\x1b[32m%s\x1b[0m', `\nSuccess: ${message}.`);
}

const printError = (message: string, stack?: string): void => {
  !stack
    ? console.log("\x1b[31m%s\x1b[0m", `\nError: ${message}.`)
    : console.log(
        "\x1b[31m%s\x1b[0m",
        `\n{ Error: '${message}.', Stack: '${stack}'`
      );
};

export {
    printSeparator,
    printInformation,
    printSuccess,
    printError
}