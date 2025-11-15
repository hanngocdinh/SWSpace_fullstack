export default function DashboardContent() {
  const stats = [
    {
      title: "Total Service Packages",
      value: "24",
      icon: (
        <div className="w-[56px] h-[56px] bg-blue-100 rounded-[14px] flex items-center justify-center">
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
      ),
    },
    {
      title: "Reserved Seats",
      value: "156",
      icon: (
        <div className="w-[56px] h-[56px] bg-green-100 rounded-[14px] flex items-center justify-center">
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
      ),
    },
    {
      title: "Total Users",
      value: "89",
      icon: (
        <div className="w-[56px] h-[56px] bg-gray-200 rounded-[14px] flex items-center justify-center">
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
      ),
    },
    {
      title: "Monthly Revenue",
      value: "$12,450",
      icon: (
        <div className="w-[56px] h-[56px] bg-yellow-100 rounded-[14px] flex items-center justify-center">
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      ),
    },
  ];

  const revenueData = [
    { month: "T1", value: 50 },
    { month: "T2", value: 30 },
    { month: "T3", value: 45 },
    { month: "T4", value: 20 },
    { month: "T5", value: 100 },
    { month: "T6", value: 30 },
  ];

  const maxRevenue = Math.max(...revenueData.map(d => d.value));

  const usageData = [
    { name: "Hot Desk", percentage: 38.6, color: "#1C1C1C" },
    { name: "Fixed Desk", percentage: 22.5, color: "#BAEDBD" },
    { name: "Private Office", percentage: 30.8, color: "#95A4FC" },
    { name: "Other", percentage: 8.1, color: "#B1E3FF" },
  ];

  return (
    <div className="min-h-full">
      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-5 mb-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-[20px] p-5 border border-[#1c1c1c] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]"
          >
            <div className="flex items-center gap-4">
              {stat.icon}
              <div>
                <p className="text-[16px] text-[#021526] mb-2 capitalize">{stat.title}</p>
                <p className="text-[24px] font-bold text-[#021526]">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Revenue by Month Chart */}
        <div className="bg-white rounded-[16px] p-6 border border-[rgba(0,0,0,0.45)] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]">
          <h3 className="text-[14px] font-semibold text-[#1c1c1c] text-center mb-8">
            Revenue by Month
          </h3>
          <div className="flex gap-4">
            {/* Y-axis labels */}
            <div className="flex flex-col justify-between text-right text-[12px] text-[rgba(28,28,28,0.4)] pt-4 pb-7">
              <span>60</span>
              <span>30</span>
              <span>15</span>
              <span>0</span>
            </div>
            
            {/* Chart area */}
            <div className="flex-1">
              {/* Grid lines */}
              <div className="relative h-[214px] mb-7">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="absolute left-0 right-0 border-t"
                    style={{
                      top: `${(i / 3) * 100}%`,
                      borderColor: i === 3 ? 'rgba(28,28,28,0.2)' : 'rgba(28,28,28,0.05)',
                    }}
                  />
                ))}
                
                {/* Bars */}
                <div className="absolute inset-0 flex items-end justify-between px-4 pb-7">
                  {revenueData.map((data, index) => (
                    <div
                      key={index}
                      className="flex-1 flex items-end justify-center"
                    >
                      <div
                        className="w-[20px] bg-[#5da07f] rounded-t-[4px]"
                        style={{
                          height: `${(data.value / maxRevenue) * 100}%`,
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
              
              {/* X-axis labels */}
              <div className="flex justify-between text-[12px] text-[rgba(28,28,28,0.4)] px-4">
                {revenueData.map((data, index) => (
                  <span key={index} className="flex-1 text-center">
                    {data.month}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Service Package Usage Rate Chart */}
        <div className="bg-white rounded-[14px] p-6 border border-[rgba(0,0,0,0.45)] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]">
          <h3 className="text-[14px] font-semibold text-[#1c1c1c] text-center mb-6">
            Service Package Usage Rate
          </h3>
          <div className="flex items-center gap-10 px-6">
            {/* Donut Chart */}
            <div className="relative w-[120px] h-[120px]">
              <svg viewBox="0 0 120 120" className="transform -rotate-90">
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke="#1C1C1C"
                  strokeWidth="20"
                  strokeDasharray={`${(38.6 / 100) * 314} 314`}
                />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke="#BAEDBD"
                  strokeWidth="20"
                  strokeDasharray={`${(22.5 / 100) * 314} 314`}
                  strokeDashoffset={`${-(38.6 / 100) * 314}`}
                />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke="#95A4FC"
                  strokeWidth="20"
                  strokeDasharray={`${(30.8 / 100) * 314} 314`}
                  strokeDashoffset={`${-((38.6 + 22.5) / 100) * 314}`}
                />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke="#B1E3FF"
                  strokeWidth="20"
                  strokeDasharray={`${(8.1 / 100) * 314} 314`}
                  strokeDashoffset={`${-((38.6 + 22.5 + 30.8) / 100) * 314}`}
                />
              </svg>
            </div>

            {/* Legend */}
            <div className="flex-1 space-y-3">
              {usageData.map((item, index) => (
                <div key={index} className="flex items-center justify-between gap-12">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className={`text-[12px] text-[#1c1c1c] ${item.name === 'Private Office' ? 'font-bold' : ''}`}>
                      {item.name}
                    </span>
                  </div>
                  <span className="text-[12px] text-[#1c1c1c]">
                    {item.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="bg-white rounded-[20px] p-6 border border-[rgba(0,0,0,0.45)]">
        <div className="flex items-center gap-3 mb-6">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 className="text-[16px] font-semibold text-[#021526]">Recent Activity</h3>
        </div>
        
        <div className="space-y-4">
          {[
            { name: "Nguyễn Văn A", action: "Subscribe to Hot Desk", time: "2 minutes ago" },
            { name: "Trần Thị B", action: "Payment Successful", time: "15 minutes ago" },
            { name: "Lê Văn C", action: "Cancel Reservation", time: "1 hours ago" },
          ].map((activity, index) => (
            <div
              key={index}
              className="bg-neutral-100 rounded-[15px] px-6 py-4 border border-[rgba(0,0,0,0.45)]"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[15px] font-semibold text-black mb-0 tracking-[1.5px]">
                    {activity.name}
                  </p>
                  <p className="text-[15px] text-black tracking-[1.6px]">
                    {activity.action}
                  </p>
                </div>
                <span className="text-[15px] text-black tracking-[1.5px]">
                  {activity.time}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
