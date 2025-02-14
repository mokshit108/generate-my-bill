// src/app/page.js
'use client'
import './globals.css';
import dynamic from 'next/dynamic';
const BillGenerator = dynamic(() => import('./components/BillGenerator'), { ssr: false });

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Invoice Generator
        </h1>
        <BillGenerator />
      </div>
    </main>
  );
}
