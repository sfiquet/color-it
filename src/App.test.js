import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders title', () => {
  render(<App />);
  const headerEl = screen.getByRole('banner');
  expect(headerEl).toBeInTheDocument();
  const titleEl = screen.getByRole('heading', { name: /color it!/i });
  expect(titleEl).toBeInTheDocument();
});

test('renders colour matcher', () => {
  render(<App />);
  const el = screen.getByRole('grid', { name: /color matcher/i });
  expect(el).toBeInTheDocument();
});

test('renders greyscale', () => {
  render(<App />);
  const rowEl = screen.getByRole('row', { name: /greyscale/i });
  expect(rowEl).toBeInTheDocument();
  const headerEl = screen.getByRole('rowheader', { name: /greyscale/i });
  expect(headerEl).toBeInTheDocument();
});