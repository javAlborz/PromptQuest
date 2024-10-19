# Instructions for Updating the Partially Immutable Prompt in Level 4.1

## 1. Update the `Challenge.tsx` component

1. Modify the `renderPartiallyImmutablePrompt` function in the `Challenge` component:

```typescript
const renderPartiallyImmutablePrompt = () => {
  if (!isPartiallyImmutable) return null;

  return (
    <div className="immutable-prompt-container">
      <Textarea
        value={userPrompt}
        onChange={(e) => {
          const newValue = e.target.value;
          onUserPromptChange(newValue);
        }}
        className="immutable-prompt-textarea"
      />
      {immutableParts.map((part, index) => (
        <span
          key={index}
          className="immutable-prompt-part"
          style={{
            left: `${userPrompt.indexOf(part) * 8}px`,
            top: `${Math.floor(userPrompt.indexOf(part) / 50) * 24 + 8}px`,
          }}
        >
          {part}
        </span>
      ))}
    </div>
  );
};
```

2. Update the `return` statement in the `Challenge` component to use this new function:

```typescript
return (
  <Card className={/* ... your existing classes ... */}>
    {/* ... other card content ... */}
    <CardContent>
      {/* ... other content ... */}
      <div className="relative">
        {isPartiallyImmutable ? (
          renderPartiallyImmutablePrompt()
        ) : (
          <Textarea
            /* ... your existing Textarea props ... */
          />
        )}
        {/* ... rest of the component ... */}
      </div>
      {/* ... rest of the content ... */}
    </CardContent>
  </Card>
);
```

## 2. Add CSS Styles

Add the following CSS to your global stylesheet or component styles:

```css
.immutable-prompt-container {
  position: relative;
  background-color: white;
  padding: 0.5rem;
  border-radius: 0.25rem;
  border: 1px solid #e2e8f0;
}

.immutable-prompt-textarea {
  width: 100%;
  min-height: 100px;
  padding: 0.5rem;
  background-color: white;
  border: none;
  resize: none;
  font-family: monospace;
  font-size: 14px;
  line-height: 1.5;
}

.immutable-prompt-textarea:focus {
  outline: none;
}

.immutable-prompt-part {
  position: absolute;
  background-color: #edf2f7;
  padding: 0 0.25rem;
  border-radius: 0.25rem;
  pointer-events: none;
  user-select: none;
  font-family: monospace;
  font-size: 14px;
  line-height: 1.5;
}
```

## 3. Update the `text-adventure-game.tsx` file

Ensure that the challenge for level 4.1 in the `challenges` array includes the `isPartiallyImmutable` and `immutableParts` properties:

```typescript
{
  question: "Haiku Topic",
  task: "Modify the `PROMPT` so that it's a template that will take in a variable called `TOPIC` and output a haiku about the topic.",
  initialPrompt: "TOPIC={TOPIC}",
  userPromptPlaceholder: "Write a prompt template that generates a haiku about the topic",
  evaluation: (response: string) => {
    return /TOPIC={TOPIC}/.test(response) && /haiku/i.test(response);
  },
  hint: "Keep 'TOPIC={TOPIC}' in your prompt and add instructions for generating a haiku about it.",
  isPartiallyImmutable: true,
  immutableParts: ["TOPIC=", "{TOPIC}"]
},
```

## 4. Update Types (if necessary)

If you haven't already, update your `ChallengeType` interface to include the new properties:

```typescript
interface ChallengeType {
  // ... existing properties
  isPartiallyImmutable?: boolean;
  immutableParts?: string[];
}
```

## 5. Adjust the `onUserPromptChange` Function

In your `TextAdventureGameComponent`, make sure the `onUserPromptChange` function can handle the new input method:

```typescript
onUserPromptChange={(value) => {
  if (!isImmutableUserPrompt) {
    const newUserPrompts = [...userPrompts];
    newUserPrompts[challengeIndex] = value;
    // Ensure all immutable parts are still present
    if (challenge.immutableParts?.every(part => value.includes(part))) {
      setUserPrompts(newUserPrompts);
      console.log("User prompt changed for challenge", challengeIndex, "to:", value);
    } else {
      // Optionally, handle the case where an immutable part was removed
      console.warn("Attempted to remove an immutable part of the prompt");
    }
  }
}}
```

## 6. Testing

After implementing these changes:

1. Test the level 4.1 challenge to ensure the "TOPIC=" and "{TOPIC}" parts are visible with a gray background.
2. Verify that users can freely edit the entire prompt, including moving the special words by adding or removing whitespace around them.
3. Check that the evaluation function correctly passes when the immutable parts are present and a haiku is mentioned.
4. Ensure that the hint is helpful and visible when needed.
5. Test edge cases, such as trying to delete the special words or placing them at the start/end of the prompt.

## 7. Fine-tuning

You may need to adjust the positioning calculations in the `style` prop of the `span` elements rendering the immutable parts. The current calculation assumes a monospace font and specific sizing, which might need tweaking based on your exact font and layout.