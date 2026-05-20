import React from 'react';

// Common Pulse classes
const pulseBg = "bg-gray-200 dark:bg-zinc-800 animate-pulse rounded-lg";
const pulseText = "bg-gray-200 dark:bg-zinc-800 animate-pulse rounded";

// 1. SKELETON PRODUCT CARD
export const SkeletonProductCard = () => {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl sm:rounded-2xl overflow-hidden border border-gray-100 dark:border-zinc-800 flex flex-col h-full">
      {/* Image container */}
      <div className="relative aspect-square bg-gray-100 dark:bg-zinc-950 overflow-hidden flex items-center justify-center p-3 sm:p-6 flex-shrink-0">
        <div className={`w-3/4 h-3/4 ${pulseBg}`} />
      </div>

      {/* Details */}
      <div className="p-3 sm:p-5 flex flex-col flex-grow space-y-3 sm:space-y-4">
        {/* Category tag */}
        <div className="flex justify-between items-center">
          <div className={`h-3 w-1/4 ${pulseText}`} />
          <div className="flex gap-1">
            <div className={`w-3 h-3 rounded-full ${pulseText}`} />
            <div className={`w-3 h-3 rounded-full ${pulseText}`} />
          </div>
        </div>

        {/* Title */}
        <div className={`h-5 w-3/4 ${pulseText}`} />

        {/* Price */}
        <div className="flex justify-between items-center pt-1">
          <div className={`h-6 w-1/3 ${pulseText}`} />
        </div>

        {/* Mock Select Size Button */}
        <div className={`w-full h-9 sm:h-11 rounded-lg sm:rounded-xl ${pulseBg} mt-auto`} />
      </div>
    </div>
  );
};

// 2. SKELETON HERO SECTION
export const SkeletonHero = () => {
  return (
    <section className="min-h-screen pt-16 sm:pt-20 relative overflow-hidden bg-gray-50 dark:bg-deep-void">
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 min-h-[calc(100vh-80px)] flex flex-col lg:flex-row items-center justify-center gap-6 sm:gap-8 relative z-10">
        {/* Left: Shoe image mock */}
        <div className="flex-1 flex items-center justify-center w-full">
          <div className="w-full max-w-[280px] sm:max-w-[380px] md:max-w-[450px] lg:max-w-[500px] aspect-[5/4] bg-gray-100 dark:bg-zinc-900 rounded-3xl animate-pulse flex items-center justify-center">
            <div className="w-4/5 h-2/3 bg-gray-200 dark:bg-zinc-800 rounded-2xl" />
          </div>
        </div>

        {/* Right: Content mock */}
        <div className="flex-1 w-full max-w-xl space-y-6 text-center lg:text-left">
          {/* Badge */}
          <div className="flex justify-center lg:justify-start">
            <div className={`w-36 h-7 rounded-full ${pulseBg}`} />
          </div>

          {/* Heading */}
          <div className="space-y-3">
            <div className={`h-10 sm:h-14 w-1/2 mx-auto lg:mx-0 ${pulseText}`} />
            <div className={`h-10 sm:h-14 w-2/3 mx-auto lg:mx-0 ${pulseText}`} />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <div className={`h-4 w-full ${pulseText}`} />
            <div className={`h-4 w-5/6 mx-auto lg:mx-0 ${pulseText}`} />
          </div>

          {/* Size mock strip */}
          <div className="space-y-2">
            <div className={`h-3 w-28 mx-auto lg:mx-0 ${pulseText}`} />
            <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${pulseBg}`} />
              ))}
            </div>
          </div>

          {/* Price & CTA */}
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 pt-4">
            <div className="space-y-1 w-24">
              <div className={`h-4 w-12 mx-auto sm:mx-0 ${pulseText}`} />
              <div className={`h-8 w-20 mx-auto sm:mx-0 ${pulseText}`} />
            </div>
            <div className={`w-full sm:flex-1 h-12 sm:h-14 rounded-2xl ${pulseBg}`} />
          </div>
        </div>
      </div>
    </section>
  );
};

// 3. SKELETON PRODUCT DETAILS
export const SkeletonProductDetails = () => {
  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-12">
      {/* Back button mock */}
      <div className={`w-16 h-5 mb-6 sm:mb-8 ${pulseText}`} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-12 lg:gap-20">
        {/* Images Column */}
        <div className="space-y-4 sm:space-y-6">
          {/* Main aspect ratio container */}
          <div className="relative aspect-square bg-gray-50 dark:bg-zinc-900/50 rounded-2xl sm:rounded-3xl p-4 sm:p-8 flex items-center justify-center animate-pulse">
            <div className="w-4/5 h-4/5 bg-gray-200/60 dark:bg-zinc-800 rounded-2xl" />
          </div>

          {/* Thumbs list */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="aspect-square bg-gray-100 dark:bg-zinc-900 rounded-xl sm:rounded-2xl p-2 sm:p-4 flex items-center justify-center animate-pulse">
                <div className="w-4/5 h-4/5 bg-gray-200 dark:bg-zinc-800 rounded-lg" />
              </div>
            ))}
          </div>
        </div>

        {/* Info Column */}
        <div className="flex flex-col space-y-6">
          {/* Category & Stock */}
          <div className="flex items-center gap-3">
            <div className={`h-5 w-24 ${pulseText}`} />
            <div className={`h-5 w-20 rounded-full ${pulseBg}`} />
          </div>

          {/* Name */}
          <div className={`h-8 sm:h-12 w-4/5 ${pulseText}`} />

          {/* Price */}
          <div className="flex items-baseline gap-4">
            <div className={`h-8 sm:h-10 w-32 ${pulseText}`} />
            <div className={`h-5 w-20 ${pulseText}`} />
            <div className={`h-6 w-16 ${pulseBg}`} />
          </div>

          {/* Description */}
          <div className="space-y-2 pt-2">
            <div className={`h-4 w-full ${pulseText}`} />
            <div className={`h-4 w-full ${pulseText}`} />
            <div className={`h-4 w-2/3 ${pulseText}`} />
          </div>

          {/* Sizes */}
          <div className="space-y-3 pt-2">
            <div className={`h-4 w-32 ${pulseText}`} />
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className={`w-11 h-11 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl ${pulseBg}`} />
              ))}
            </div>
          </div>

          {/* Quantity selector */}
          <div className="space-y-2 pt-2">
            <div className={`h-4 w-16 ${pulseText}`} />
            <div className={`w-32 h-10 sm:h-12 rounded-lg sm:rounded-xl ${pulseBg}`} />
          </div>

          {/* Add to cart mock */}
          <div className={`w-full h-12 sm:h-14 rounded-xl sm:rounded-2xl ${pulseBg}`} />

          {/* Features strip */}
          <div className="grid grid-cols-3 gap-2 pt-6 border-t border-gray-150 dark:border-zinc-800">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col items-center space-y-2">
                <div className={`w-6 h-6 rounded-full ${pulseBg}`} />
                <div className={`h-3 w-16 ${pulseText}`} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// 4. SKELETON TABLE (for Order History and Admin tables)
export const SkeletonTable = ({ rows = 5, cols = 5 }) => {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 overflow-hidden w-full">
      <div className="overflow-x-auto">
        <table className="min-w-full w-full">
          <thead className="bg-gray-50 dark:bg-black">
            <tr>
              {[...Array(cols)].map((_, i) => (
                <th key={i} className="p-3 sm:p-4 text-left">
                  <div className={`h-4 w-${i % 2 === 0 ? '20' : '16'} ${pulseText}`} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
            {[...Array(rows)].map((_, r) => (
              <tr key={r} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/20 transition-colors">
                {[...Array(cols)].map((_, c) => (
                  <td key={c} className="p-3 sm:p-4">
                    {c === 0 ? (
                      // First column: typical ID or name with image shape option
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex-shrink-0 ${pulseBg}`} />
                        <div className={`h-4 w-24 sm:w-32 ${pulseText}`} />
                      </div>
                    ) : (
                      // Regular column: pills or simple tags
                      <div className={`h-4 w-${c === cols - 1 ? '16' : c % 2 === 0 ? '24' : '12'} ${pulseText}`} />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// 5. SKELETON ORDER CARD (For User profile view)
export const SkeletonOrderCard = () => {
  return (
    <div className="bg-gray-50 dark:bg-zinc-900 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-gray-100 dark:border-zinc-800 space-y-4">
      {/* Top bar info */}
      <div className="flex justify-between items-start pb-4 border-b border-gray-200 dark:border-zinc-800">
        <div className="space-y-1">
          <div className={`h-3 w-16 ${pulseText}`} />
          <div className={`h-4 w-28 ${pulseText}`} />
        </div>
        <div className="text-right space-y-1">
          <div className={`h-3 w-12 ${pulseText}`} />
          <div className={`h-4 w-20 ${pulseText}`} />
        </div>
      </div>

      {/* Items mock list */}
      <div className="space-y-3">
        {[1].map((i) => (
          <div key={i} className="flex gap-3 sm:gap-4 items-center">
            <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-lg flex-shrink-0 ${pulseBg}`} />
            <div className="flex-1 space-y-1.5 min-w-0">
              <div className={`h-4 w-3/4 ${pulseText}`} />
              <div className={`h-3 w-1/3 ${pulseText}`} />
            </div>
            <div className={`h-4 w-12 flex-shrink-0 ${pulseText}`} />
          </div>
        ))}
      </div>

      {/* Bottom status and total */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-4 border-t border-gray-200 dark:border-zinc-800">
        <div className="space-y-1">
          <div className={`h-3 w-20 ${pulseText}`} />
          <div className={`h-6 w-24 ${pulseText}`} />
        </div>
        <div className="flex gap-2 items-center">
          <div className={`w-16 h-6 rounded-full ${pulseBg}`} />
          <div className={`w-16 h-6 rounded-full ${pulseBg}`} />
          <div className={`w-16 h-7 rounded-lg ${pulseBg}`} />
        </div>
      </div>
    </div>
  );
};

// 6. SKELETON ORDER DETAILS
export const SkeletonOrderDetails = () => {
  return (
    <div className="container mx-auto px-4 sm:px-6 max-w-4xl animate-pulse">
      {/* Back button link mock */}
      <div className={`w-32 h-5 mb-6 sm:mb-8 ${pulseText}`} />

      <div className="bg-white dark:bg-zinc-900 rounded-xl sm:rounded-2xl md:rounded-3xl p-4 sm:p-6 md:p-8 shadow-sm border border-gray-100 dark:border-zinc-800 mb-6 sm:mb-8 space-y-8">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-6 sm:pb-8 border-b border-gray-100 dark:border-zinc-800 gap-4">
          <div className="space-y-2 w-1/2">
            <div className={`h-8 w-3/4 ${pulseText}`} />
            <div className={`h-4 w-1/3 ${pulseText}`} />
          </div>
          <div className="flex md:flex-col items-end gap-2 w-full md:w-auto">
            <div className={`w-28 h-8 rounded-full ${pulseBg}`} />
            <div className={`w-28 h-8 rounded-full ${pulseBg}`} />
          </div>
        </div>

        {/* Info Grid (Address & Payment) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 md:gap-12">
          <div className="space-y-3">
            <div className={`h-4 w-1/3 ${pulseText}`} />
            <div className={`h-24 w-full rounded-2xl ${pulseBg}`} />
          </div>
          <div className="space-y-3">
            <div className={`h-4 w-1/3 ${pulseText}`} />
            <div className={`h-24 w-full rounded-2xl ${pulseBg}`} />
          </div>
        </div>

        {/* Order Items Mock */}
        <div className="space-y-4">
          <div className={`h-4 w-1/4 ${pulseText}`} />
          <div className="border border-gray-100 dark:border-zinc-800 rounded-2xl divide-y divide-gray-100 dark:divide-zinc-800 overflow-hidden">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center gap-4 sm:gap-6 p-4 sm:p-6 bg-gray-50 dark:bg-black/50">
                <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-lg ${pulseBg}`} />
                <div className="flex-1 space-y-2">
                  <div className={`h-4 w-1/2 ${pulseText}`} />
                  <div className={`h-3 w-1/4 ${pulseText}`} />
                </div>
                <div className="text-right space-y-1">
                  <div className={`h-4 w-16 ${pulseText}`} />
                  <div className={`h-3 w-12 ${pulseText}`} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary pricing */}
        <div className="pt-8 border-t border-gray-100 dark:border-zinc-800 flex justify-end">
          <div className="w-full md:w-1/3 space-y-3">
            <div className="flex justify-between">
              <div className={`h-4 w-16 ${pulseText}`} />
              <div className={`h-4 w-16 ${pulseText}`} />
            </div>
            <div className="flex justify-between">
              <div className={`h-4 w-16 ${pulseText}`} />
              <div className={`h-4 w-16 ${pulseText}`} />
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-zinc-700">
              <div className={`h-6 w-20 ${pulseText}`} />
              <div className={`h-6 w-20 ${pulseText}`} />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
