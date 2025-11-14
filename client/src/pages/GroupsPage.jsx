import React from 'react';
import Header from '../components/Header';
import NeuralBackground from '../components/NeuralBackground';
import Footer from '../components/Footer';

export default function GroupsPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white relative flex flex-col">
      <NeuralBackground />
      
      <div className="relative z-10 flex flex-col flex-1">
        <Header />

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-8xl mb-6">🚧</div>
            <h2 className="text-4xl font-bold mb-4 bg-linear-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
              Under Development
            </h2>
            <p className="text-gray-400 text-xl mb-8">
              Groups feature is coming soon!
            </p>
            <p className="text-gray-500 max-w-md mx-auto">
              We're working hard to bring you collaborative learning groups where you can connect with multiple skill-swappers at once.
            </p>
          </div>
        </main>
        
        <Footer />
      </div>
    </div>
  );
}
