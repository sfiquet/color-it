import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders title', () => {
  render(<App />);
  const titleEl = screen.getByRole('banner', /color it/i);
  expect(titleEl).toBeInTheDocument();
});
