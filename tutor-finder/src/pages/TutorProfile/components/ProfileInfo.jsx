import React from 'react';
import { FaUserGraduate, FaLanguage, FaBriefcase, FaGraduationCap, FaMapMarkerAlt } from 'react-icons/fa';
import SubjectTags from '../../../components/common/SubjectTags';

const ProfileInfo = ({ tutor }) => {
  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Main Info */}
      <div className="lg:col-span-2 space-y-6">
        {/* Bio */}
        <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">About Me</h2>
          <p className="text-gray-600 leading-relaxed">{tutor.bio}</p>
        </div>

        {/* Education */}
        {tutor.education && tutor.education.length > 0 && (
          <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FaGraduationCap className="text-primary-500" />
              Education
            </h2>
            <div className="space-y-4">
              {tutor.education.map((edu, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary-500 mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-gray-900">{edu.degree}</p>
                    <p className="text-sm text-gray-600">{edu.institution}</p>
                    <p className="text-xs text-gray-500">{edu.year}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Experience */}
        {tutor.experience && (
          <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FaBriefcase className="text-primary-500" />
              Experience
            </h2>
            <p className="text-gray-600">{tutor.experience} of teaching experience</p>
            {tutor.skills && (
              <div className="mt-3 flex flex-wrap gap-2">
                {tutor.skills.map((skill, index) => (
                  <span key={index} className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-700">
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sidebar Info */}
      <div className="space-y-6">
        {/* Subjects */}
        <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-3">Subjects</h3>
          <SubjectTags subjects={tutor.subjects} />
        </div>

        {/* Levels */}
        <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-3">Teaching Levels</h3>
          <div className="flex flex-wrap gap-2">
            {tutor.levels.map((level) => (
              <span key={level} className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-medium">
                {level}
              </span>
            ))}
          </div>
        </div>

        {/* Languages */}
        {tutor.languages && (
          <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FaLanguage className="text-primary-500" />
              Languages
            </h3>
            <div className="flex flex-wrap gap-2">
              {tutor.languages.map((language) => (
                <span key={language} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                  {language}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Availability */}
        <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-3">Availability</h3>
          <div className="flex flex-wrap gap-2">
            {tutor.availability.map((day) => (
              <span key={day} className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                {day}
              </span>
            ))}
          </div>
        </div>

        {/* Location Map Placeholder */}
        <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-3">Location</h3>
          <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
            <div className="text-center">
              <FaMapMarkerAlt className="text-primary-500 w-8 h-8 mx-auto mb-2" />
              <p className="text-sm text-gray-600">{tutor.location}</p>
              <p className="text-xs text-gray-500 mt-1">Interactive map coming soon</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileInfo;