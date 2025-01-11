#!/usr/bin/env node
import './utils/checkConfig';
import { program, setStdIn } from './program';

// enables piping of information into the CLI through stdin
if (process.stdin.isTTY) {
  program.parse(process.argv);
} else {
  process.stdin.on('readable', () => {
    const chunk = process.stdin.read();
    if (chunk !== null) {
      setStdIn(chunk);
    }
  });

  process.stdin.on('end', () => {
    program.parse(process.argv);
  });
}
