"use client";

import { useState } from 'react';

export default function TestButton() {
  const [clicked, setClicked] = useState(false);

  return (
    <div>
      <button
        onClick={() => setClicked(!clicked)}
        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded"
      >
        Test Button
      </button>
      {clicked && <div className="mt-2 text-green-600">Button clicked!</div>}
    </div>
  );
}