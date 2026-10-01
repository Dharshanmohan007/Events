import React, { useEffect } from "react";
import DashboardHeader from "../Dashboards/ICTC-Dashboard/DashboardHeader";
import EventsAttendingHead from "../Dashboards/EventsAttending-Dashboard/EventsAttendingHead";
import axios from "axios";
import {
  CalendarDays,
  Clock3,
  UserRound,
  Phone,
  NotebookText,
} from "lucide-react";

const EventsAttendingDetailView = ({ data }) => {
  console.log("event attending data : ", data);

  const token = localStorage.getItem("");

  //   const fetchEventAttendingDataHandler = async () => {
  //     try{
  //         const res = await axios.get(``)

  //     }catch(err){
  //         console.log("Error occured while fetching fetching events attending data : ", err.message)
  //     }
  //   };

  //   useEffect(() => {
  //     fetchEventAttendingDataHandler()
  //   }, []);

  return (
    <main className="bg-[#0b1326] min-h-screen p-4">
      {" "}
      {/* Program Name */}{" "}
      <div className="bg-[#1c2537] rounded-md mb-2">
        {" "}
        <div className="flex items-center justify-between px-3 py-4">
          {" "}
          <span className="text-[16px] text-gray-400">
            {" "}
            Name of the program{" "}
          </span>{" "}
          <span className="text-[14px] font-medium text-white">
            {" "}
            {data?.data?.programName}{" "}
          </span>{" "}
        </div>{" "}
      </div>{" "}
      {/* Program Dates */}{" "}
      <div className="grid grid-cols-1 md:grid-cols-2 bg-[#1c2537] rounded-md mb-2">
        {" "}
        {/* Date From */}{" "}
        <div className="flex items-center justify-between px-3 py-4 border-b md:border-b-0 md:border-r border-[#3a4354]">
          {" "}
          <div className="flex items-center gap-2">
            {" "}
            <CalendarDays className="w-4 h-4 text-[#8B5CF6]" />{" "}
            <span className="text-[16px] text-gray-400">
              {" "}
              Date of the program ( From ){" "}
            </span>{" "}
          </div>{" "}
          <span className="text-[14px] font-medium text-white">
            {" "}
            {data?.data?.programFromDate}{" "}
          </span>{" "}
        </div>{" "}
        {/* Date To */}{" "}
        <div className="flex items-center justify-between px-3 py-4">
          {" "}
          <div className="flex items-center gap-2">
            {" "}
            <CalendarDays className="w-4 h-4 text-[#8B5CF6]" />{" "}
            <span className="text-[16px] text-gray-400">
              {" "}
              Date of the program ( To ){" "}
            </span>{" "}
          </div>{" "}
          <span className="text-[14px] font-medium text-white">
            {" "}
            {data?.data?.programToDate}{" "}
          </span>{" "}
        </div>{" "}
      </div>{" "}
      {/* Participants / Expected Outcome */}{" "}
      <div className="grid grid-cols-1 md:grid-cols-2 bg-[#1c2537] rounded-md mb-2">
        {" "}
        {/* Participants */}{" "}
        <div className="flex items-center justify-between px-3 py-4 border-b md:border-b-0 md:border-r border-[#3a4354]">
          {" "}
          <span className="text-[16px] text-gray-400">
            {" "}
            Total number of Participants{" "}
          </span>{" "}
          <span className="text-[14px] font-medium text-white">
            {" "}
            {data?.data?.numberOfParticipants}{" "}
            <p>
              {data?.data?.numberOfParticipants == 1 ? "Member" : "Members"}
            </p>
          </span>{" "}
        </div>{" "}
        {/* Expected Outcome */}{" "}
        <div className="flex items-center justify-between px-3 py-4">
          {" "}
          <span className="text-[16px] text-gray-400">
            {" "}
            Expected outcome of the program{" "}
          </span>{" "}
          <span className="text-[14px] font-medium text-white">
            {" "}
            {data?.data?.expectedOutcome}{" "}
          </span>{" "}
        </div>{" "}
      </div>{" "}
      {/* Participant Information */}{" "}
      
      {data?.data?.participants?.map((item)=>{
        return <div className="grid grid-cols-1 sm:grid-cols-3 bg-[#1c2537] rounded-md mb-2">
        {" "}
        {/* Participant Name */}{" "}
        <div className="px-3 py-4 border-b sm:border-b-0 sm:border-r border-[#3a4354]">
          {" "}
          <div className="flex items-center gap-2 mb-2">
            {" "}
            <UserRound className="w-4 h-4 text-[#a78bfa]" />{" "}
            <span className="text-[12px] text-gray-500 uppercase">
              {" "}
              Participant Name{" "}
            </span>{" "}
          </div>{" "}
          <p className="text-[14px] font-medium text-white">
            {" "}
            {item?.name}{" "}
          </p>{" "}
        </div>{" "}
        {/* Mobile Number */}{" "}
        <div className="px-3 py-4 border-b sm:border-b-0 sm:border-r border-[#3a4354]">
          {" "}
          <div className="flex items-center gap-2 mb-2">
            {" "}
            <Phone className="w-4 h-4 text-[#a78bfa]" />{" "}
            <span className="text-[12px] text-gray-500 uppercase">
              {" "}
              Accompanying Mobile Number{" "}
            </span>{" "}
          </div>{" "}
          <p className="text-[14px] font-medium text-white">
            {" "}
            {item?.phoneNumber}{" "}
          </p>{" "}
        </div>{" "}
        {/* Department */}{" "}
        <div className="px-3 py-4">
          {" "}
          <div className="flex items-center gap-2 mb-2">
            {" "}
            <UserRound className="w-4 h-4 text-[#a78bfa]" />{" "}
            <span className="text-[12px] text-gray-500 uppercase">
              {" "}
              Participant Department{" "}
            </span>{" "}
          </div>{" "}
          <p className="text-[14px] font-medium text-white">{item?.department}</p>{" "}
        </div>{" "}
      </div>
      })}
      
      {" "}
      {/* Off Campus Details */}{" "}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mb-2">
        {" "}
        {/* Off Campus Date From */}{" "}
        <div className="bg-[#1c2537] rounded-md px-3 py-3">
          {" "}
          <div className="flex items-center gap-2">
            {" "}
            <CalendarDays className="w-4 h-4 text-[#8B5CF6]" />{" "}
            <span className="text-[12px] text-gray-400 uppercase">
              {" "}
              Off Campus Date ( From ){" "}
            </span>{" "}
          </div>{" "}
          <p className="text-[14px] font-medium text-white mt-2">
            {" "}
            12/06/2026{" "}
          </p>{" "}
        </div>{" "}
        {/* Off Campus Time From */}{" "}
        <div className="bg-[#1c2537] rounded-md px-3 py-3">
          {" "}
          <div className="flex items-center gap-2">
            {" "}
            <Clock3 className="w-4 h-4 text-[#8B5CF6]" />{" "}
            <span className="text-[12px] text-gray-400 uppercase">
              {" "}
              Off Campus Time ( From ){" "}
            </span>{" "}
          </div>{" "}
          <p className="text-[14px] font-medium text-white mt-2">
            {" "}
            09:30 AM{" "}
          </p>{" "}
        </div>{" "}
        {/* Off Campus Date To */}{" "}
        <div className="bg-[#1c2537] rounded-md px-3 py-3">
          {" "}
          <div className="flex items-center gap-2">
            {" "}
            <CalendarDays className="w-4 h-4 text-[#8B5CF6]" />{" "}
            <span className="text-[12px] text-gray-400 uppercase">
              {" "}
              Off Campus Date ( To ){" "}
            </span>{" "}
          </div>{" "}
          <p className="text-[14px] font-medium text-white mt-2">
            {" "}
            12/06/2026{" "}
          </p>{" "}
        </div>{" "}
        {/* Off Campus Time To */}{" "}
        <div className="bg-[#1c2537] rounded-md px-3 py-3">
          {" "}
          <div className="flex items-center gap-2">
            {" "}
            <Clock3 className="w-4 h-4 text-[#8B5CF6]" />{" "}
            <span className="text-[12px] text-gray-400 uppercase">
              {" "}
              Off Campus Time ( To ){" "}
            </span>{" "}
          </div>{" "}
          <p className="text-[14px] font-medium text-white mt-2">
            {" "}
            09:30 AM{" "}
          </p>{" "}
        </div>{" "}
      </div>{" "}
      {/* Requirements */}{" "}
      <div className="grid grid-cols-1 sm:grid-cols-3 bg-[#1c2537] rounded-md mb-2">
        {" "}
        {/* Food */}{" "}
        <div className="flex items-center justify-between px-3 py-4 border-b sm:border-b-0 sm:border-r border-[#3a4354]">
          {" "}
          <span className="text-[16px] text-gray-400">
            {" "}
            Food Required{" "}
          </span>{" "}
          <span className="text-[14px] font-medium text-green-400">
            {" "}
            Yes{" "}
          </span>{" "}
        </div>{" "}
        {/* Transport */}{" "}
        <div className="flex items-center justify-between px-3 py-4 border-b sm:border-b-0 sm:border-r border-[#3a4354]">
          {" "}
          <span className="text-[16px] text-gray-400">
            {" "}
            Transport Required{" "}
          </span>{" "}
          <span className="text-[14px] font-medium text-green-400">
            {" "}
            Yes{" "}
          </span>{" "}
        </div>{" "}
        {/* Accommodation */}{" "}
        <div className="flex items-center justify-between px-3 py-4">
          {" "}
          <span className="text-[16px] text-gray-400">
            {" "}
            Accommodation Required{" "}
          </span>{" "}
          <span className="text-[14px] font-medium text-green-400">
            {" "}
            Yes{" "}
          </span>{" "}
        </div>{" "}
      </div>{" "}
      {/* Special Requirement */}{" "}
      <div className="bg-[#1c2537] rounded-md p-4">
        {" "}
        <div className="flex items-center gap-2 mb-3">
          {" "}
          <NotebookText className="w-4 h-4 text-[#a78bfa]" />{" "}
          <span className="text-[16px] font-medium text-white">
            {" "}
            Special Requirement{" "}
          </span>{" "}
        </div>{" "}
        <p className="text-[14px] text-gray-400 leading-relaxed">
          {" "}
          Lorem Ipsum is simply dummy text of the printing and typesetting
          industry. Lorem Ipsum has been the industry's standard dummy text ever
          since the 1500s. Lorem Ipsum is simply dummy text of the printing and
          typesetting industry. Lorem Ipsum has been the industry's standard
          dummy text ever since the 1500s.{" "}
        </p>{" "}
      </div>{" "}
    </main>
  );
};

export default EventsAttendingDetailView;
