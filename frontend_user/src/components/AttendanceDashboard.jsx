import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useQR } from '../contexts/QRContext';

const DashboardContainer = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  padding: 30px;
  color: white;
  box-shadow: 0 15px 35px rgba(102, 126, 234, 0.3);
  margin: 20px 0;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.5"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
    opacity: 0.3;
  }
`;

const DashboardTitle = styled.h2`
  margin: 0 0 30px 0;
  font-size: 28px;
  font-weight: 700;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  position: relative;
  z-index: 1;

  &::before {
    content: '📊';
    font-size: 32px;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin: 30px 0;
  position: relative;
  z-index: 1;
`;

const StatCard = styled.div`
  background: rgba(255, 255, 255, 0.15);
  border-radius: 15px;
  padding: 20px;
  text-align: center;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    background: rgba(255, 255, 255, 0.2);
    box-shadow: 0 10px 25px rgba(0,0,0,0.2);
  }
`;

const StatIcon = styled.div`
  font-size: 32px;
  margin-bottom: 10px;
`;

const StatValue = styled.div`
  font-size: 28px;
  font-weight: 700;
  margin: 8px 0;
  color: #FFE082;
`;

const StatLabel = styled.div`
  font-size: 14px;
  opacity: 0.9;
  font-weight: 500;
`;

const AttendanceList = styled.div`
  margin: 30px 0;
  position: relative;
  z-index: 1;
`;

const AttendanceHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const AttendanceTitle = styled.h3`
  margin: 0;
  font-size: 20px;
  font-weight: 600;
`;

const LoadMoreButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const AttendanceItem = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 16px;
  margin: 12px 0;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: translateX(5px);
  }
`;

const AttendanceHeader2 = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
`;

const AttendanceSpace = styled.div`
  font-weight: 600;
  font-size: 16px;
  color: #FFE082;
`;

const AttendanceStatus = styled.div`
  background: ${props => props.isActive ? 'rgba(76, 175, 80, 0.3)' : 'rgba(96, 125, 139, 0.3)'};
  color: ${props => props.isActive ? '#4CAF50' : '#607D8B'};
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid ${props => props.isActive ? '#4CAF50' : '#607D8B'};
`;

const AttendanceDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 10px;
  font-size: 13px;
  opacity: 0.9;
`;

const AttendanceDetail = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;

  .icon {
    width: 16px;
    text-align: center;
  }
`;

const FilterSection = styled.div`
  display: flex;
  gap: 15px;
  margin: 20px 0;
  flex-wrap: wrap;
  position: relative;
  z-index: 1;
`;

const FilterButton = styled.button`
  background: ${props => props.active ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)'};
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);

  &:hover {
    background: rgba(255, 255, 255, 0.25);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  opacity: 0.7;
  position: relative;
  z-index: 1;

  .icon {
    font-size: 48px;
    margin-bottom: 16px;
  }

  .message {
    font-size: 16px;
    margin-bottom: 8px;
  }

  .submessage {
    font-size: 14px;
    opacity: 0.8;
  }
`;

const RefreshButton = styled.button`
  background: linear-gradient(45deg, #FF6B6B, #FF8E8E);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  margin: 10px;
  transition: all 0.3s ease;
  box-shadow: 0 5px 15px rgba(255, 107, 107, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(255, 107, 107, 0.4);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const AttendanceDashboard = () => {
  const { getAttendanceHistory, attendanceHistory, loading } = useQR();
  const [stats, setStats] = useState({
    totalCheckIns: 0,
    activeCheckIns: 0,
    totalDuration: 0,
    averageRating: 0
  });
  const [filter, setFilter] = useState('all'); // all, active, completed
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadAttendanceData();
  }, []);

  useEffect(() => {
    calculateStats();
  }, [attendanceHistory]);

  const loadAttendanceData = async (resetData = true) => {
    try {
      const currentSkip = resetData ? 0 : skip;
      const result = await getAttendanceHistory(10, currentSkip);
      
      if (result.success) {
        setHasMore(result.checkIns.length === 10);
        if (resetData) {
          setSkip(10);
        } else {
          setSkip(prev => prev + 10);
        }
      }
    } catch (error) {
      console.error('Failed to load attendance data:', error);
    }
  };

  const loadMore = async () => {
    await loadAttendanceData(false);
  };

  const calculateStats = () => {
    if (!attendanceHistory.length) {
      setStats({
        totalCheckIns: 0,
        activeCheckIns: 0,
        totalDuration: 0,
        averageRating: 0
      });
      return;
    }

    const totalCheckIns = attendanceHistory.length;
    const activeCheckIns = attendanceHistory.filter(item => !item.checkOutTime).length;
    const completedCheckIns = attendanceHistory.filter(item => item.checkOutTime);
    
    const totalDuration = completedCheckIns.reduce((sum, item) => {
      return sum + (item.duration || 0);
    }, 0);

    const ratingsProvided = attendanceHistory.filter(item => item.rating && item.rating > 0);
    const averageRating = ratingsProvided.length > 0 
      ? ratingsProvided.reduce((sum, item) => sum + item.rating, 0) / ratingsProvided.length 
      : 0;

    setStats({
      totalCheckIns,
      activeCheckIns,
      totalDuration: Math.round(totalDuration / 60), // Convert to hours
      averageRating: averageRating.toFixed(1)
    });
  };

  const getFilteredAttendance = () => {
    if (filter === 'active') {
      return attendanceHistory.filter(item => !item.checkOutTime);
    }
    if (filter === 'completed') {
      return attendanceHistory.filter(item => item.checkOutTime);
    }
    return attendanceHistory;
  };

  const formatDuration = (minutes) => {
    if (!minutes) return 'Active';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const formatDateTime = (dateTime) => {
    return new Date(dateTime).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredAttendance = getFilteredAttendance();

  return (
    <DashboardContainer>
      <DashboardTitle>Attendance Dashboard</DashboardTitle>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', position: 'relative', zIndex: 1 }}>
        <FilterSection>
          <FilterButton 
            active={filter === 'all'} 
            onClick={() => setFilter('all')}
          >
            📊 All ({attendanceHistory.length})
          </FilterButton>
          <FilterButton 
            active={filter === 'active'} 
            onClick={() => setFilter('active')}
          >
            🟢 Active ({stats.activeCheckIns})
          </FilterButton>
          <FilterButton 
            active={filter === 'completed'} 
            onClick={() => setFilter('completed')}
          >
            ✅ Completed ({attendanceHistory.length - stats.activeCheckIns})
          </FilterButton>
        </FilterSection>

        <RefreshButton 
          onClick={() => loadAttendanceData(true)}
          disabled={loading}
        >
          {loading ? '🔄 Loading...' : '🔄 Refresh'}
        </RefreshButton>
      </div>

      <StatsGrid>
        <StatCard>
          <StatIcon>📈</StatIcon>
          <StatValue>{stats.totalCheckIns}</StatValue>
          <StatLabel>Total Check-ins</StatLabel>
        </StatCard>

        <StatCard>
          <StatIcon>🟢</StatIcon>
          <StatValue>{stats.activeCheckIns}</StatValue>
          <StatLabel>Active Sessions</StatLabel>
        </StatCard>

        <StatCard>
          <StatIcon>⏱️</StatIcon>
          <StatValue>{stats.totalDuration}</StatValue>
          <StatLabel>Hours Worked</StatLabel>
        </StatCard>

        <StatCard>
          <StatIcon>⭐</StatIcon>
          <StatValue>{stats.averageRating || 'N/A'}</StatValue>
          <StatLabel>Avg Rating</StatLabel>
        </StatCard>
      </StatsGrid>

      <AttendanceList>
        <AttendanceHeader>
          <AttendanceTitle>
            📋 Recent Activity ({filteredAttendance.length})
          </AttendanceTitle>
          {hasMore && filteredAttendance.length > 0 && (
            <LoadMoreButton 
              onClick={loadMore} 
              disabled={loading}
            >
              {loading ? '⏳ Loading...' : '📄 Load More'}
            </LoadMoreButton>
          )}
        </AttendanceHeader>

        {filteredAttendance.length === 0 ? (
          <EmptyState>
            <div className="icon">🏢</div>
            <div className="message">No attendance records found</div>
            <div className="submessage">
              {filter === 'active' && 'No active check-ins at the moment'}
              {filter === 'completed' && 'No completed sessions yet'}
              {filter === 'all' && 'Start using QR codes to track your attendance!'}
            </div>
          </EmptyState>
        ) : (
          filteredAttendance.map((attendance) => (
            <AttendanceItem key={attendance._id}>
              <AttendanceHeader2>
                <AttendanceSpace>
                  {attendance.bookingId?.spaceType || 'Unknown Space'}
                </AttendanceSpace>
                <AttendanceStatus isActive={!attendance.checkOutTime}>
                  {attendance.checkOutTime ? 'Completed' : 'Active'}
                </AttendanceStatus>
              </AttendanceHeader2>

              <AttendanceDetails>
                <AttendanceDetail>
                  <span className="icon">🕐</span>
                  In: {formatDateTime(attendance.checkInTime)}
                </AttendanceDetail>

                {attendance.checkOutTime && (
                  <AttendanceDetail>
                    <span className="icon">🕑</span>
                    Out: {formatDateTime(attendance.checkOutTime)}
                  </AttendanceDetail>
                )}

                <AttendanceDetail>
                  <span className="icon">⏱️</span>
                  Duration: {formatDuration(attendance.duration)}
                </AttendanceDetail>

                {attendance.rating && (
                  <AttendanceDetail>
                    <span className="icon">⭐</span>
                    Rating: {attendance.rating}/5
                  </AttendanceDetail>
                )}

                {attendance.location && (
                  <AttendanceDetail>
                    <span className="icon">📍</span>
                    Location: {attendance.location.latitude.toFixed(2)}, {attendance.location.longitude.toFixed(2)}
                  </AttendanceDetail>
                )}

                <AttendanceDetail>
                  <span className="icon">📱</span>
                  Device: {attendance.deviceInfo?.platform || 'Unknown'}
                </AttendanceDetail>
              </AttendanceDetails>

              {attendance.notes && (
                <div style={{ 
                  marginTop: '12px', 
                  padding: '8px 12px', 
                  background: 'rgba(255,255,255,0.1)', 
                  borderRadius: '8px', 
                  fontSize: '13px',
                  fontStyle: 'italic'
                }}>
                  💭 "{attendance.notes}"
                </div>
              )}
            </AttendanceItem>
          ))
        )}
      </AttendanceList>
    </DashboardContainer>
  );
};

export default AttendanceDashboard;
