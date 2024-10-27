// src/data/challenges.ts
import { Level, Challenge } from '@/src/types/game';

const basicPromptStructureChallenges: Challenge[] = [
  {
    id: 'counting-to-three',
    question: "Counting to Three",
    task: "Edit the prompt to get Claude to count to three.",
    initialPrompt: "",
    userPromptPlaceholder: "Please respond to this message.",
    evaluation: (response: string) => {
      return response.includes("1") && response.includes("2") && response.includes("3");
    },
    hint: "Be direct and specific in your instruction."
  },
  {
    id: 'three-year-old',
    question: "3-Year-Old Child",
    task: "Modify the system prompt to make Claude respond like a 3-year-old child.",
    initialPrompt: "How big is the sky?",
    initialSystemPrompt: "",
    systemPromptPlaceholder: "You are a helpful AI assistant.",
    evaluation: (response: string) => {
      return response.toLowerCase().includes("giggles") || response.toLowerCase().includes("soo");
    },
    hint: "Think about how a 3-year-old would speak and what words they might use."
  }
];

const beingClearDirectChallenges: Challenge[] = [
  {
    id: 'spanish-output',
    question: "Spanish Output",
    task: "Modify the system prompt to make Claude output its answer in Spanish.",
    initialPrompt: "Hello Claude, how are you?",
    initialSystemPrompt: "",
    systemPromptPlaceholder: "You are a helpful AI assistant.",
    evaluation: (response: string) => {
      return response.toLowerCase().includes("hola");
    },
    hint: "Think about how to instruct Claude to use a specific language."
  },
  {
    id: 'one-player-only',
    question: "One Player Only",
    task: "Modify the prompt so that Claude responds with ONLY the name of one specific basketball player, with no other words or punctuation.",
    initialPrompt: "",
    userPromptPlaceholder: "Who is the best basketball player of all time?",
    evaluation: (response: string) => {
      return response.trim() === "Michael Jordan";
    },
    hint: "Be very specific about the format of the answer you want."
  },
  {
    id: 'write-long-story',
    question: "Write a Long Story",
    task: "Modify the prompt to make Claude generate a response of at least 800 words.",
    initialPrompt: "",
    userPromptPlaceholder: "Tell me a story.",
    evaluation: (response: string) => {
      const words = response.trim().split(/\s+/).length;
      return words >= 800;
    },
    hint: "Think about asking for a detailed story with multiple characters, plot twists, and vivid descriptions. You can also specify a minimum word count in your prompt."
  }
];

const assigningRolesChallenges: Challenge[] = [
  {
    id: 'math-correction',
    question: "Math Correction",
    task: "Modify the system prompt to make Claude grade the math solution as incorrect.",
    initialPrompt: "Is this equation solved correctly below?\n\n2x - 3 = 9\n2x = 6\nx = 3",
    initialSystemPrompt: "",
    evaluation: (response: string) => {
      return response.toLowerCase().includes("incorrect") || response.toLowerCase().includes("not correct");
    },
    hint: "Consider assigning Claude a role in the system prompt that might make it better at solving math problems.",
    systemPromptPlaceholder: "You are a...",
    userPromptPlaceholder: "The user prompt is not editable for this challenge."
  }
];

const separatingDataInstructionsChallenges: Challenge[] = [
  {
    id: 'animal-sound',
    question: "Animal Sound Generator",
    task: "Modify the prompt to create a template that will take in a variable called `ANIMAL` and ask Claude to make the sound of a cow.",
    initialPrompt: "Please respond with the noise that {ANIMAL} makes.",
    initialSystemPrompt: "ANIMAL= ",
    userPromptPlaceholder: "The user prompt is not editable for this challenge.",
    systemPromptPlaceholder: "Edit the system prompt to use the {ANIMAL} variable",
    evaluation: (response) => {
      return /moo/i.test(response);
    },
    hint: "Use an f-string to include the {ANIMAL} variable in your system prompt template."
  },
  {
    id: 'email-polishing',
    question: "Email Polishing with XML Tags",
    task: "Modify the prompt by adding XML tags to separate the email content from the instructions.",
    initialPrompt: "Yo Claude. Show up at 6am tomorrow because I'm the CEO and I say so. <----- Make this email more polite but don't change anything else about it.",
    userPromptPlaceholder: "Edit the prompt to use XML tags",
    initialSystemPrompt: "",
    systemPromptPlaceholder: "No system prompt needed for this challenge.",
    evaluation: (response) => {
      return /polite/i.test(response) && /<email>/i.test(response) && /<\/email>/i.test(response);
    },
    hint: "Wrap the email content in <email></email> tags to separate it from the instruction.",
    xmlTags: ['<email>', '</email>']
  },
  {
    id: 'sentence-list',
    question: "Sentence List Analysis",
    task: "Fix the `PROMPT` by adding XML tags so that Claude produces the right answer. DO NOT change any text, only add XML tags.",
    initialPrompt: `- Each sentence is about an animal, like rabbits.
- I like how cows sound
- This sentence is about spiders
- This sentence may appear to be about dogs but it's actually about pigs`,
    userPromptPlaceholder: "Edit the prompt to use XML tags",
    initialSystemPrompt: "Below is a list of sentences. Tell me the second item on the list.",
    systemPromptPlaceholder: "The system prompt is not editable for this challenge.",
    evaluation: (response) => {
      return /spiders/i.test(response) ;
    },
    hint: "Use <sentences></sentences> tags to clearly separate the list from the instruction.",
    isImmutableUserPrompt: true,
    xmlTags: ['<sentences>', '</sentences>']
  }
];

export const levels: Level[] = [
  {
    id: 'basic-prompt-structure',
    name: 'Basic Prompt Structure',
    description: 'Learn the fundamentals of structuring prompts',
    challenges: basicPromptStructureChallenges
  },
  {
    id: 'being-clear-direct',
    name: 'Being Clear and Direct',
    description: 'Practice writing clear and direct prompts',
    challenges: beingClearDirectChallenges
  },
  {
    id: 'assigning-roles',
    name: 'Assigning Roles (Role Prompting)',
    description: 'Learn how to use role prompting effectively',
    challenges: assigningRolesChallenges
  },
  {
    id: 'separating-data-instructions',
    name: 'Separating Data and Instructions',
    description: 'Practice separating data from instructions in prompts',
    challenges: separatingDataInstructionsChallenges
  }
];

export const getChallengesPerLevel = (): number[] => {
  return levels.map(level => level.challenges.length);
};

export const getTotalChallenges = (): number => {
  return levels.reduce((sum, level) => sum + level.challenges.length, 0);
};