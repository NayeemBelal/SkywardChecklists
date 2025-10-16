import React, { useState } from 'react';
import { Employee } from '@skyward/shared';

interface EmployeeSearchBarProps {
  employees: Employee[];
  onSearch: (query: string) => void;
  onSelectEmployee: (employee: Employee) => void;
  placeholder?: string;
}

export const EmployeeSearchBar: React.FC<EmployeeSearchBarProps> = ({
  employees,
  onSearch,
  onSelectEmployee,
  placeholder = "Search employees..."
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
    setShowResults(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.length === 0) {
      setShowResults(false);
    }
  };

  const handleEmployeeSelect = (employee: Employee) => {
    onSelectEmployee(employee);
    setSearchQuery('');
    setShowResults(false);
  };

  const filteredEmployees = employees.filter(employee =>
    employee.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative">
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Search
        </button>
      </form>

      {showResults && searchQuery && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {filteredEmployees.length > 0 ? (
            filteredEmployees.map((employee) => (
              <button
                key={employee.id}
                onClick={() => handleEmployeeSelect(employee)}
                className="w-full px-4 py-2 text-left text-gray-900 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
              >
                {employee.full_name}
              </button>
            ))
          ) : (
            <div className="px-4 py-2 text-gray-500">
              No employees found
            </div>
          )}
        </div>
      )}
    </div>
  );
};
