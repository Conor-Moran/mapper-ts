# mapper-ts

## General Idea
Playing with mapping from one object structure to another.

## Approach
- Define a mapping (fieldPathA <-> fieldPathB)
  - Initially using pairs of field paths/tuples
- Take a source object and deflate it
  - By deflate it is mean make it a flat object one level deep.
- Iterate the mapping and copy values to a target object
- Inflate the target object
  - i.e. Turn the flat object into a structured object (tree)

## Future Ideas
- Conditions (to apply the mapping or not)
- Map multiple fields to single field (with an append strategy)
- Inverse mapping

## Run It
- Open in VSCode
- In terminal, run:
  - npm run dev
