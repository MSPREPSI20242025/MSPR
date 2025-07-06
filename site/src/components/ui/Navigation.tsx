'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { useTranslation } from '../TranslationProvider';

export function Navigation() {
  const pathname = usePathname();
  const { t } = useTranslation();

  const navigation = [
    { name: t('nav.home'), href: '/' },
    { name: t('nav.covid'), href: '/covid' },
    { name: t('nav.mpox'), href: '/mpox' },
    { name: t('nav.compare'), href: '/compare' },
    { name: t('nav.allData'), href: '/data' },
  ];

  return (
    <nav className="bg-white dark:bg-gray-800 shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-gray-900 dark:text-white">{t('home.title')}</span>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={clsx(
                    pathname === item.href
                      ? 'border-indigo-500 text-gray-900 dark:text-white'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 hover:text-gray-700 dark:hover:text-gray-300',
                    'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium'
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
} 