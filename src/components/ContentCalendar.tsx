import React, { useState, useMemo } from 'react';
import { Calendar, momentLocalizer, View } from 'react-big-calendar';
import moment from 'moment';
import { Plus, Instagram, Youtube, Mail, Globe, FileText, ChevronLeft, ChevronRight, Linkedin } from 'lucide-react';
import { useSupabase } from '../contexts/SupabaseContext';
import { ContentPost } from '../lib/supabase';

import 'react-big-calendar/lib/css/react-big-calendar.css';

// Custom X Icon component
const XIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const localizer = momentLocalizer(moment);

// Configure moment to start week on Monday
moment.updateLocale('en', {
  week: {
    dow: 1, // Monday is the first day of the week
  },
});

interface ContentCalendarProps {
  onAddPost: () => void;
}

const ContentCalendar: React.FC<ContentCalendarProps> = ({ onAddPost }) => {
  const { contentPosts } = useSupabase();
  const [calendarView] = useState<View>('month');
  const [calendarDate, setCalendarDate] = useState(new Date());

  // Custom date cell component with circular borders
  const CustomDateCell = ({ value }: { value: Date }) => {
    const isToday = moment(value).isSame(moment(), 'day');
    const dateNumber = value.getDate();
    
    return (
      <div className="relative h-full min-h-[120px] p-2">
        <div className={`absolute top-2 left-2 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 ${
          isToday 
            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-transparent' 
            : 'border-gray-300 text-gray-700 bg-white'
        }`}>
          {dateNumber}
        </div>
      </div>
    );
  };

  // Custom toolbar with arrow navigation
  const CustomToolbar = ({ date, onNavigate }: { date: Date; onNavigate: (action: string) => void }) => {
    const monthYear = moment(date).format('MMMM YYYY');
    
    return (
      <div className="flex items-center justify-center mb-6">
        <button
          onClick={() => onNavigate('PREV')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 mr-4"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h2 className="text-xl font-semibold text-gray-900 mx-4">
          {monthYear}
        </h2>
        <button
          onClick={() => onNavigate('NEXT')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 ml-4"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>
    );
  };

  // Simple calendar event component
  const CalendarEventBlock = ({ event }: { event: { resource: ContentPost } }) => {
    const post = event.resource as ContentPost;
    const PlatformIcon = platformIcons[post.platform as keyof typeof platformIcons];
    
    return (
      <div 
        className={`
          p-1.5 rounded-md text-xs font-medium cursor-pointer
          transition-all duration-200 hover:shadow-md hover:scale-105
          bg-purple-100 text-purple-800 border border-purple-200
          hover:bg-purple-200 active:bg-purple-300 shadow-sm
          flex items-center space-x-1 min-h-[20px] max-w-full
        `}
        title={`${post.title} - ${post.platform} (${post.status})`}
      >
        {PlatformIcon && (
          <PlatformIcon className="w-3 h-3 flex-shrink-0 text-purple-600" />
        )}
        <span className="truncate font-medium text-purple-800 flex-1">{post.title}</span>
        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
          post.status === 'published' ? 'bg-green-500' : 
          post.status === 'scheduled' ? 'bg-blue-500' : 'bg-gray-400'
        }`} />
      </div>
    );
  };

  const platformIcons = {
    newsletter: Mail,
    x: XIcon,
    pinterest: Globe,
    tiktok: FileText,
    instagram: Instagram,
    youtube: Youtube,
    linkedin: Linkedin
  };

  const platformColors = {
    newsletter: 'bg-blue-100 text-blue-800 border-blue-200',
    x: 'bg-gray-100 text-gray-800 border-gray-200',
    pinterest: 'bg-red-100 text-red-800 border-red-200',
    tiktok: 'bg-black text-white border-gray-800',
    instagram: 'bg-pink-100 text-pink-800 border-pink-200',
    youtube: 'bg-red-100 text-red-800 border-red-200',
    linkedin: 'bg-blue-100 text-blue-800 border-blue-200'
  };

  const statusColors = {
    draft: 'bg-gray-100 text-gray-800 border-gray-200',
    scheduled: 'bg-blue-100 text-blue-800 border-blue-200',
    published: 'bg-green-100 text-green-800 border-green-200'
  };

  // Transform content posts for calendar
  const calendarEvents = useMemo(() => {
    console.log('\n=== CALENDAR EVENTS PROCESSING ===');
    console.log('📊 Raw contentPosts from database:', contentPosts);
    console.log('📊 Total posts from database:', contentPosts.length);
    console.log('📅 Current calendar date:', calendarDate);
    console.log('📅 Current calendar month/year:', {
      month: calendarDate.getMonth() + 1,
      year: calendarDate.getFullYear()
    });
    
    console.log('\n--- ANALYZING EACH POST ---');
    contentPosts.forEach((post, index) => {
      console.log(`📝 Post ${index + 1}:`, {
        title: post.title,
        platform: post.platform,
        status: post.status,
        scheduled_date: post.scheduled_date,
        scheduled_date_type: typeof post.scheduled_date,
        has_scheduled_date: !!post.scheduled_date
      });
    });
    
    console.log('\n--- FILTERING POSTS WITH SCHEDULED DATES ---');
    const events = contentPosts
      .filter(post => {
        const hasScheduledDate = !!post.scheduled_date;
        console.log(`✅ Post "${post.title}" has scheduled_date:`, hasScheduledDate, post.scheduled_date);
        return hasScheduledDate;
      })
      .map(post => {
        const scheduledDateString = post.scheduled_date!;
        console.log(`\n🔄 Processing Post: "${post.title}"`);
        console.log('📅 Original scheduled_date from DB:', scheduledDateString);
        console.log('📅 Type of scheduled_date:', typeof scheduledDateString);
        
        // Handle ISO strings with timezone info by converting to local date
        let finalDate: Date;
        
        if (scheduledDateString.includes('T')) {
          // ISO string with time - extract just the date part to avoid timezone issues
          const isoDate = new Date(scheduledDateString);
          console.log('📅 Parsed ISO Date object:', isoDate);
          console.log('📅 ISO date components:', {
            year: isoDate.getFullYear(),
            month: isoDate.getMonth() + 1,
            day: isoDate.getDate(),
            utcYear: isoDate.getUTCFullYear(),
            utcMonth: isoDate.getUTCMonth() + 1,
            utcDay: isoDate.getUTCDate()
          });
          
          // Use UTC date components to create local date (avoids timezone conversion)
          finalDate = new Date(isoDate.getUTCFullYear(), isoDate.getUTCMonth(), isoDate.getUTCDate());
          console.log('📅 Created local date from UTC components:', finalDate);
        } else {
          // Date-only string - create local date to avoid timezone issues
          const [year, month, day] = scheduledDateString.split('-').map(Number);
          finalDate = new Date(year, month - 1, day); // month is 0-based
          console.log('📅 Created local date from date-only string:', finalDate);
        }
        
        console.log('📅 Final date for calendar:', finalDate);
        console.log('📅 Final date components:', {
          year: finalDate.getFullYear(),
          month: finalDate.getMonth() + 1, // +1 because getMonth() is 0-based
          day: finalDate.getDate(),
          dayOfWeek: finalDate.toLocaleDateString('en-US', { weekday: 'long' }),
          dateString: finalDate.toDateString()
        });
        
        // Check if this date falls within the current calendar view
        const currentMonth = calendarDate.getMonth();
        const currentYear = calendarDate.getFullYear();
        const postMonth = finalDate.getMonth();
        const postYear = finalDate.getFullYear();
        
        const isInCurrentView = currentMonth === postMonth && currentYear === postYear;
        console.log('📅 Date comparison for current view:', {
          currentMonth: currentMonth + 1,
          currentYear,
          postMonth: postMonth + 1,
          postYear,
          isInCurrentView
        });
        
        // Create calendar event
        const event = {
          id: post.id,
          title: post.title,
          start: finalDate,
          end: finalDate,
          resource: post
        };
        
        console.log('📅 Created calendar event:', {
          id: event.id,
          title: event.title,
          startDate: event.start.toDateString(),
          startISO: event.start.toISOString()
        });
        
        return event;
      });
    
    console.log('\n--- FINAL CALENDAR EVENTS ---');
    console.log('📊 Final calendar events array:', events);
    console.log('📊 Number of events created:', events.length);
    console.log('📊 Events by date:');
    events.forEach(event => {
      console.log(`  📅 "${event.title}": ${event.start.toDateString()}`);
    });
    
    // Check if any events should be visible in current month
    const currentMonthEvents = events.filter(event => {
      const eventMonth = event.start.getMonth();
      const eventYear = event.start.getFullYear();
      const currentMonth = calendarDate.getMonth();
      const currentYear = calendarDate.getFullYear();
      const isVisible = eventMonth === currentMonth && eventYear === currentYear;
      return isVisible;
    });
    
    console.log('\n--- CURRENT MONTH VISIBILITY ---');
    events.forEach(event => {
      const eventMonth = event.start.getMonth();
      const eventYear = event.start.getFullYear();
      const currentMonth = calendarDate.getMonth();
      const currentYear = calendarDate.getFullYear();
      const isVisible = eventMonth === currentMonth && eventYear === currentYear;
      console.log(`👁️ Event "${event.title}" visibility:`, {
        eventDate: event.start.toDateString(),
        eventMonth: eventMonth + 1,
        eventYear,
        currentMonth: currentMonth + 1,
        currentYear,
        isVisible
      });
    });
    
    console.log('📊 Events in current month view:', currentMonthEvents.length);
    console.log('📊 Should show', currentMonthEvents.length, 'events in current calendar view');
    console.log('=== END CALENDAR EVENTS PROCESSING ===\n');
    
    return events;
  }, [contentPosts, calendarDate, calendarView]);

  // Custom calendar date cell wrapper
  const CustomDateCellWrapper = ({ children, value }: { children: React.ReactNode; value: Date }) => {
    const isToday = moment(value).isSame(moment(), 'day');
    
    return (
      <div 
        className="relative h-full min-h-[120px] p-2 hover:bg-purple-50 transition-colors duration-200"
      >
        <div className={`absolute top-2 left-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium z-10 ${
          isToday 
            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
            : 'bg-white border border-gray-300 text-gray-700'
        }`}>
          {value.getDate()}
        </div>
        <div className="pt-8 space-y-1 overflow-hidden">
          {children}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="space-y-6">
        {/* Add Post Action */}
        <div className="flex justify-end">
          <button
            onClick={onAddPost}
            className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg shadow-purple-500/25"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Post
          </button>
        </div>

        {/* Calendar View */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-200/50">
          <div style={{ height: '600px' }}>
            <Calendar
              localizer={localizer}
              events={calendarEvents}
              startAccessor="start"
              endAccessor="end"
              view="month"
              views={['month']}
              date={calendarDate}
              onNavigate={setCalendarDate}
              components={{
                event: CalendarEventBlock,
                dateCellWrapper: CustomDateCellWrapper,
                toolbar: CustomToolbar
              }}
              onSelectSlot={() => onAddPost()}
              onSelectEvent={(event) => {
                console.log('Event clicked:', event);
              }}
              selectable={true}
              popup={false}
              showMultiDayTimes={false}
              step={60}
              timeslots={1}
              eventPropGetter={() => ({
                style: {
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderRadius: '0px',
                  padding: '0',
                  margin: '0',
                  boxShadow: 'none',
                  outline: 'none'
                }
              })}
              formats={{
                dateFormat: 'D',
                eventTimeRangeFormat: () => '',
                timeGutterFormat: () => '',
                dayFormat: 'ddd',
                monthHeaderFormat: 'MMMM YYYY'
              }}
              dayLayoutAlgorithm="no-overlap"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default ContentCalendar;