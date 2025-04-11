
import { useState, useCallback } from 'react';
import {
  dumpAuthLogs,
  getAuthLogs,
  clearAuthLogs,
  getLogsByPrefix,
  getLogsByLevel,
  searchLogs,
  getRecentLogs,
  downloadLogs,
  AUTH_LOG_LEVELS
} from '@/utils/debug/authLogger';

export const useDebugLogs = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<{
    prefix?: string;
    level?: string;
    searchTerm?: string;
  }>({});

  const fetchAllLogs = useCallback(() => {
    setLoading(true);
    try {
      const allLogs = getAuthLogs();
      setLogs(allLogs);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const filterByPrefix = useCallback((prefix: string) => {
    setLoading(true);
    try {
      const filteredLogs = getLogsByPrefix(prefix);
      setLogs(filteredLogs);
      setFilter(prev => ({ ...prev, prefix }));
    } catch (error) {
      console.error('Error filtering logs by prefix:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const filterByLevel = useCallback((level: keyof typeof AUTH_LOG_LEVELS) => {
    setLoading(true);
    try {
      const filteredLogs = getLogsByLevel(AUTH_LOG_LEVELS[level]);
      setLogs(filteredLogs);
      setFilter(prev => ({ ...prev, level }));
    } catch (error) {
      console.error('Error filtering logs by level:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const search = useCallback((term: string) => {
    setLoading(true);
    try {
      const searchResults = searchLogs(term);
      setLogs(searchResults);
      setFilter(prev => ({ ...prev, searchTerm: term }));
    } catch (error) {
      console.error('Error searching logs:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRecentLogs = useCallback((count: number = 20) => {
    setLoading(true);
    try {
      const recentLogs = getRecentLogs(count);
      setLogs(recentLogs);
    } catch (error) {
      console.error('Error fetching recent logs:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleClearLogs = useCallback(() => {
    try {
      clearAuthLogs();
      setLogs([]);
    } catch (error) {
      console.error('Error clearing logs:', error);
    }
  }, []);

  const handleDumpLogs = useCallback(() => {
    try {
      return dumpAuthLogs();
    } catch (error) {
      console.error('Error dumping logs:', error);
      return [];
    }
  }, []);

  const handleDownloadLogs = useCallback(() => {
    try {
      downloadLogs();
    } catch (error) {
      console.error('Error downloading logs:', error);
    }
  }, []);

  return {
    logs,
    loading,
    filter,
    fetchAllLogs,
    filterByPrefix,
    filterByLevel,
    search,
    fetchRecentLogs,
    clearLogs: handleClearLogs,
    dumpLogs: handleDumpLogs,
    downloadLogs: handleDownloadLogs
  };
};
