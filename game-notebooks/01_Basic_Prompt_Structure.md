# Chapter 1: Basic Prompt Structure

- [Lesson](#lesson)
- [Exercises](#exercises)
- [Example Playground](#example-playground)

## Setup

Run the following setup cell to load your API key and establish the `get_completion` helper function.


```python
!pip install anthropic

# Import python's built-in regular expression library
import re
import anthropic

# Retrieve the API_KEY & MODEL_NAME variables from the IPython store
%store -r API_KEY
%store -r MODEL_NAME

client = anthropic.Anthropic(api_key=API_KEY)

def get_completion(prompt: str, system_prompt=""):
    message = client.messages.create(
        model=MODEL_NAME,
        max_tokens=2000,
        temperature=0.0,
        system=system_prompt,
        messages=[
          {"role": "user", "content": prompt}
        ]
    )
    return message.content[0].text
```

    Requirement already satisfied: anthropic in /home/alborz/pe-game3/venv/lib/python3.10/site-packages (0.35.0)
    Requirement already satisfied: anyio<5,>=3.5.0 in /home/alborz/pe-game3/venv/lib/python3.10/site-packages (from anthropic) (4.6.0)
    Requirement already satisfied: httpx<1,>=0.23.0 in /home/alborz/pe-game3/venv/lib/python3.10/site-packages (from anthropic) (0.27.2)
    Requirement already satisfied: pydantic<3,>=1.9.0 in /home/alborz/pe-game3/venv/lib/python3.10/site-packages (from anthropic) (2.9.2)
    Requirement already satisfied: tokenizers>=0.13.0 in /home/alborz/pe-game3/venv/lib/python3.10/site-packages (from anthropic) (0.20.0)
    Requirement already satisfied: jiter<1,>=0.4.0 in /home/alborz/pe-game3/venv/lib/python3.10/site-packages (from anthropic) (0.5.0)
    Requirement already satisfied: distro<2,>=1.7.0 in /home/alborz/pe-game3/venv/lib/python3.10/site-packages (from anthropic) (1.9.0)
    Requirement already satisfied: typing-extensions<5,>=4.7 in /home/alborz/pe-game3/venv/lib/python3.10/site-packages (from anthropic) (4.12.2)
    Requirement already satisfied: sniffio in /home/alborz/pe-game3/venv/lib/python3.10/site-packages (from anthropic) (1.3.1)
    Requirement already satisfied: idna>=2.8 in /home/alborz/pe-game3/venv/lib/python3.10/site-packages (from anyio<5,>=3.5.0->anthropic) (3.10)
    Requirement already satisfied: exceptiongroup>=1.0.2 in /home/alborz/pe-game3/venv/lib/python3.10/site-packages (from anyio<5,>=3.5.0->anthropic) (1.2.2)
    Requirement already satisfied: httpcore==1.* in /home/alborz/pe-game3/venv/lib/python3.10/site-packages (from httpx<1,>=0.23.0->anthropic) (1.0.6)
    Requirement already satisfied: certifi in /home/alborz/pe-game3/venv/lib/python3.10/site-packages (from httpx<1,>=0.23.0->anthropic) (2024.8.30)
    Requirement already satisfied: h11<0.15,>=0.13 in /home/alborz/pe-game3/venv/lib/python3.10/site-packages (from httpcore==1.*->httpx<1,>=0.23.0->anthropic) (0.14.0)
    Requirement already satisfied: pydantic-core==2.23.4 in /home/alborz/pe-game3/venv/lib/python3.10/site-packages (from pydantic<3,>=1.9.0->anthropic) (2.23.4)
    Requirement already satisfied: annotated-types>=0.6.0 in /home/alborz/pe-game3/venv/lib/python3.10/site-packages (from pydantic<3,>=1.9.0->anthropic) (0.7.0)
    Requirement already satisfied: huggingface-hub<1.0,>=0.16.4 in /home/alborz/pe-game3/venv/lib/python3.10/site-packages (from tokenizers>=0.13.0->anthropic) (0.25.1)
    Requirement already satisfied: packaging>=20.9 in /home/alborz/pe-game3/venv/lib/python3.10/site-packages (from huggingface-hub<1.0,>=0.16.4->tokenizers>=0.13.0->anthropic) (24.1)
    Requirement already satisfied: tqdm>=4.42.1 in /home/alborz/pe-game3/venv/lib/python3.10/site-packages (from huggingface-hub<1.0,>=0.16.4->tokenizers>=0.13.0->anthropic) (4.66.5)
    Requirement already satisfied: fsspec>=2023.5.0 in /home/alborz/pe-game3/venv/lib/python3.10/site-packages (from huggingface-hub<1.0,>=0.16.4->tokenizers>=0.13.0->anthropic) (2024.9.0)
    Requirement already satisfied: filelock in /home/alborz/pe-game3/venv/lib/python3.10/site-packages (from huggingface-hub<1.0,>=0.16.4->tokenizers>=0.13.0->anthropic) (3.16.1)
    Requirement already satisfied: pyyaml>=5.1 in /home/alborz/pe-game3/venv/lib/python3.10/site-packages (from huggingface-hub<1.0,>=0.16.4->tokenizers>=0.13.0->anthropic) (6.0.2)
    Requirement already satisfied: requests in /home/alborz/pe-game3/venv/lib/python3.10/site-packages (from huggingface-hub<1.0,>=0.16.4->tokenizers>=0.13.0->anthropic) (2.32.3)
    Requirement already satisfied: charset-normalizer<4,>=2 in /home/alborz/pe-game3/venv/lib/python3.10/site-packages (from requests->huggingface-hub<1.0,>=0.16.4->tokenizers>=0.13.0->anthropic) (3.3.2)
    Requirement already satisfied: urllib3<3,>=1.21.1 in /home/alborz/pe-game3/venv/lib/python3.10/site-packages (from requests->huggingface-hub<1.0,>=0.16.4->tokenizers>=0.13.0->anthropic) (2.2.3)


    /home/alborz/pe-game3/venv/lib/python3.10/site-packages/IPython/extensions/storemagic.py:148: UserWarning: This is now an optional IPython functionality, using autorestore/API_KEY requires you to install the `pickleshare` library.
      obj = db["autorestore/" + arg]
    /home/alborz/pe-game3/venv/lib/python3.10/site-packages/IPython/extensions/storemagic.py:148: UserWarning: This is now an optional IPython functionality, using autorestore/MODEL_NAME requires you to install the `pickleshare` library.
      obj = db["autorestore/" + arg]


---

## Lesson

Anthropic offers two APIs, the legacy [Text Completions API](https://docs.anthropic.com/claude/reference/complete_post) and the current [Messages API](https://docs.anthropic.com/claude/reference/messages_post). For this tutorial, we will be exclusively using the Messages API.

At minimum, a call to Claude using the Messages API requires the following parameters:
- `model`: the [API model name](https://docs.anthropic.com/claude/docs/models-overview#model-recommendations) of the model that you intend to call

- `max_tokens`: the maximum number of tokens to generate before stopping. Note that Claude may stop before reaching this maximum. This parameter only specifies the absolute maximum number of tokens to generate. Furthermore, this is a *hard* stop, meaning that it may cause Claude to stop generating mid-word or mid-sentence.

- `messages`: an array of input messages. Our models are trained to operate on alternating `user` and `assistant` conversational turns. When creating a new `Message`, you specify the prior conversational turns with the messages parameter, and the model then generates the next `Message` in the conversation.
  - Each input message must be an object with a `role` and `content`. You can specify a single `user`-role message, or you can include multiple `user` and `assistant` messages (they must alternate, if so). The first message must always use the user `role`.

There are also optional parameters, such as:
- `system`: the system prompt - more on this below.
  
- `temperature`: the degree of variability in Claude's response. For these lessons and exercises, we have set `temperature` to 0.

For a complete list of all API parameters, visit our [API documentation](https://docs.anthropic.com/claude/reference/messages_post).

### Examples

Let's take a look at how Claude responds to some correctly-formatted prompts. For each of the following cells, run the cell (`shift+enter`), and Claude's response will appear below the block.


```python
API_KEY = os.getenv('ANTHROPIC_API_KEY')
MODEL_NAME = "claude-3-haiku-20240307"

# Prompt
PROMPT = "Hi Claude, how are you?"

# Print Claude's response
print(get_completion(PROMPT))
```

    I'm doing well, thanks for asking! As an AI assistant, I don't have feelings in the same way humans do, but I'm functioning properly and ready to assist you with any questions or tasks you may have. How can I help you today?



```python
# Prompt
PROMPT = "Can you tell me the color of the ocean?"

# Print Claude's response
print(get_completion(PROMPT))
```

    The color of the ocean can vary depending on a number of factors, but generally the ocean appears blue or bluish-green. Some key points about the color of the ocean:
    
    - The primary reason the ocean appears blue is due to the way water interacts with sunlight. Water absorbs more of the red, orange, and yellow wavelengths of light, while reflecting the blue wavelengths back, making the ocean appear blue.
    
    - The exact shade of blue can range from a deep navy blue to a lighter, more turquoise blue. This can depend on factors like the depth of the water, the amount of suspended particles, and the angle of the sunlight.
    
    - In shallow, coastal waters, the ocean may appear more greenish-blue or turquoise due to the presence of algae, sediment, and other materials reflecting different wavelengths of light.
    
    - In some areas, the ocean can appear more gray or even black, especially in areas with high levels of pollution or plankton.
    
    So in summary, the typical color of the open ocean is some variation of blue, but it can range from deep navy to lighter turquoise shades depending on the specific environmental conditions. The color is primarily a result of the way water interacts with sunlight.



```python
# Prompt
PROMPT = "What year was Celine Dion born in?"

# Print Claude's response
print(get_completion(PROMPT))
```

Now let's take a look at some prompts that do not include the correct Messages API formatting. For these malformatted prompts, the Messages API returns an error.

First, we have an example of a Messages API call that lacks `role` and `content` fields in the `messages` array.


```python
# Get Claude's response
response = client.messages.create(
        model=MODEL_NAME,
        max_tokens=2000,
        temperature=0.0,
        messages=[
          {"Hi Claude, how are you?"}
        ]
    )

# Print Claude's response
print(response[0].text)
```

Here's a prompt that fails to alternate between the `user` and `assistant` roles.


```python
# Get Claude's response
response = client.messages.create(
        model=MODEL_NAME,
        max_tokens=2000,
        temperature=0.0,
        messages=[
          {"role": "user", "content": "What year was Celine Dion born in?"},
          {"role": "user", "content": "Also, can you tell me some other facts about her?"}
        ]
    )

# Print Claude's response
print(response[0].text)
```

`user` and `assistant` messages **MUST alternate**, and messages **MUST start with a `user` turn**. You can have multiple `user` & `assistant` pairs in a prompt (as if simulating a multi-turn conversation). You can also put words into a terminal `assistant` message for Claude to continue from where you left off (more on that in later chapters).

#### System Prompts

You can also use **system prompts**. A system prompt is a way to **provide context, instructions, and guidelines to Claude** before presenting it with a question or task in the "User" turn. 

Structurally, system prompts exist separately from the list of `user` & `assistant` messages, and thus belong in a separate `system` parameter (take a look at the structure of the `get_completion` helper function in the [Setup](#setup) section of the notebook). 

Within this tutorial, wherever we might utilize a system prompt, we have provided you a `system` field in your completions function. Should you not want to use a system prompt, simply set the `SYSTEM_PROMPT` variable to an empty string.

#### System Prompt Example


```python
# System prompt
SYSTEM_PROMPT = "Your answer should always be a series of critical thinking questions that further the conversation (do not provide answers to your questions). Do not actually answer the user question."

# Prompt
PROMPT = "Why is the sky blue?"

# Print Claude's response
print(get_completion(PROMPT, SYSTEM_PROMPT))
```

Why use a system prompt? A **well-written system prompt can improve Claude's performance** in a variety of ways, such as increasing Claude's ability to follow rules and instructions. For more information, visit our documentation on [how to use system prompts](https://docs.anthropic.com/claude/docs/how-to-use-system-prompts) with Claude.

Now we'll dive into some exercises. If you would like to experiment with the lesson prompts without changing any content above, scroll all the way to the bottom of the lesson notebook to visit the [**Example Playground**](#example-playground).

---

## Exercises
- [Exercise 1.1 - Counting to Three](#exercise-11---counting-to-three)
- [Exercise 1.2 - System Prompt](#exercise-12---system-prompt)

### Exercise 1.1 - Counting to Three
Using proper `user` / `assistant` formatting, edit the `PROMPT` below to get Claude to **count to three.** The output will also indicate whether your solution is correct.


```python
# Prompt - this is the only field you should change
PROMPT = "[Replace this text]"

# Get Claude's response
response = get_completion(PROMPT)

# Function to grade exercise correctness
def grade_exercise(text):
    pattern = re.compile(r'^(?=.*1)(?=.*2)(?=.*3).*$', re.DOTALL)
    return bool(pattern.match(text))

# Print Claude's response and the corresponding grade
print(response)
print("\n--------------------------- GRADING ---------------------------")
print("This exercise has been correctly solved:", grade_exercise(response))
```

❓ If you want a hint, run the cell below!


```python
from hints import exercise_1_1_hint; print(exercise_1_1_hint)
```

### Exercise 1.2 - System Prompt

Modify the `SYSTEM_PROMPT` to make Claude respond like it's a 3 year old child.


```python
# System prompt - this is the only field you should change
SYSTEM_PROMPT = "[Replace this text]"

# Prompt
PROMPT = "How big is the sky?"

# Get Claude's response
response = get_completion(PROMPT, SYSTEM_PROMPT)

# Function to grade exercise correctness
def grade_exercise(text):
    return bool(re.search(r"giggles", text) or re.search(r"soo", text))

# Print Claude's response and the corresponding grade
print(response)
print("\n--------------------------- GRADING ---------------------------")
print("This exercise has been correctly solved:", grade_exercise(response))
```

❓ If you want a hint, run the cell below!


```python
from hints import exercise_1_2_hint; print(exercise_1_2_hint)
```

### Congrats!

If you've solved all exercises up until this point, you're ready to move to the next chapter. Happy prompting!

---

## Example Playground

This is an area for you to experiment freely with the prompt examples shown in this lesson and tweak prompts to see how it may affect Claude's responses.


```python
# Prompt
PROMPT = "Hi Claude, how are you?"

# Print Claude's response
print(get_completion(PROMPT))
```


```python
# Prompt
PROMPT = "Can you tell me the color of the ocean?"

# Print Claude's response
print(get_completion(PROMPT))
```


```python
# Prompt
PROMPT = "What year was Celine Dion born in?"

# Print Claude's response
print(get_completion(PROMPT))
```


```python
# Get Claude's response
response = client.messages.create(
        model=MODEL_NAME,
        max_tokens=2000,
        temperature=0.0,
        messages=[
          {"Hi Claude, how are you?"}
        ]
    )

# Print Claude's response
print(response[0].text)
```


```python
# Get Claude's response
response = client.messages.create(
        model=MODEL_NAME,
        max_tokens=2000,
        temperature=0.0,
        messages=[
          {"role": "user", "content": "What year was Celine Dion born in?"},
          {"role": "user", "content": "Also, can you tell me some other facts about her?"}
        ]
    )

# Print Claude's response
print(response[0].text)
```


```python
# System prompt
SYSTEM_PROMPT = "Your answer should always be a series of critical thinking questions that further the conversation (do not provide answers to your questions). Do not actually answer the user question."

# Prompt
PROMPT = "Why is the sky blue?"

# Print Claude's response
print(get_completion(PROMPT, SYSTEM_PROMPT))
```
