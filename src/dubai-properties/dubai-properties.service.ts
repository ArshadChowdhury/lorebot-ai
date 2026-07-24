// // import { Injectable } from '@nestjs/common';

// // @Injectable()
// // export class DubaiPropertiesService {}


// import { Injectable } from '@nestjs/common';

// export interface DubaiProperty {
//   id: number;
//   propertyName: string;
//   images: { type: string; path: string }[];
//   propertyArea: { id: number; areaName: string };
//   developerType: { id: number; name: string };
//   propertyType: { id: number; name: string };
//   unitType: { size: string };
//   developmentType: { name: string };
// }

// // Wrapper interface for paginated and metadata-rich responses
// export interface PaginatedPropertyResponse {
//   data: DubaiProperty[];
//   meta: {
//     totalItems: number;
//     currentPage: number;
//     totalPages: number;
//     itemsPerPage: number;
//   };
//   filtersAvailable: {
//     developers: string[];
//     areas: string[];
//   };
// }

// @Injectable()
// export class DubaiPropertiesService {
//   private readonly properties: DubaiProperty[] = [
//     {
//       id: 1,
//       propertyName: "Marina Shores",
//       images: [
//         { type: "cover", path: "/images/home/slider-1.jpeg" },
//         { type: "gallery", path: "/images/prop1_alt.jpg" }
//       ],
//       propertyArea: { id: 101, areaName: "Dubai Marina" },
//       developerType: { id: 201, name: "Emaar Properties" },
//       propertyType: { id: 301, name: "Apartment" },
//       unitType: { size: "1,200 sqft" },
//       developmentType: { name: "Off-Plan" }
//     },
//     {
//       id: 2,
//       propertyName: "Downtown Heights",
//       images: [{ type: "cover", path: "/images/home/slider-2.jpeg" }],
//       propertyArea: { id: 102, areaName: "Downtown Dubai" },
//       developerType: { id: 202, name: "DAMAC Properties" },
//       propertyType: { id: 301, name: "Apartment" },
//       unitType: { size: "1,850 sqft" },
//       developmentType: { name: "Ready" }
//     },
//     {
//       id: 3,
//       propertyName: "Palm Residences",
//       images: [{ type: "cover", path: "/images/home/slider-3.jpg" }],
//       propertyArea: { id: 103, areaName: "Palm Jumeirah" },
//       developerType: { id: 203, name: "Nakheel" },
//       propertyType: { id: 302, name: "Villa" },
//       unitType: { size: "3,200 sqft" },
//       developmentType: { name: "Ready" }
//     },
//     {
//       id: 4,
//       propertyName: "Emaar Beachfront",
//       images: [{ type: "cover", path: "/images/home/slider-4.jpg" }],
//       propertyArea: { id: 104, areaName: "Dubai Harbour" },
//       developerType: { id: 201, name: "Emaar Properties" },
//       propertyType: { id: 301, name: "Apartment" },
//       unitType: { size: "900 sqft" },
//       developmentType: { name: "Off-Plan" }
//     },
//     {
//       id: 5,
//       propertyName: "Sobha Hartland",
//       images: [{ type: "cover", path: "/images/home/slider-5.jpg" }],
//       propertyArea: { id: 105, areaName: "MBR City" },
//       developerType: { id: 204, name: "Sobha Realty" },
//       propertyType: { id: 303, name: "Townhouse" },
//       unitType: { size: "1,150 sqft" },
//       developmentType: { name: "Off-Plan" }
//     },
//     {
//       id: 6,
//       propertyName: "Burj Vista",
//       images: [{ type: "cover", path: "/images/home/slider-6.jpg"}],
//       propertyArea: { id: 102, areaName: "Downtown Dubai" },
//       developerType: { id: 201, name: "Emaar Properties" },
//       propertyType: { id: 304, name: "Penthouse" },
//       unitType: { size: "2,100 sqft" },
//       developmentType: { name: "Ready" }
//     }
//   ];

//   findAll(page: number = 1, limit: number = 3): PaginatedPropertyResponse {
//     const startIndex = (page - 1) * limit;
//     const endIndex = page * limit;
//     const paginatedItems = this.properties.slice(startIndex, endIndex);

//     return {
//       data: paginatedItems,
//       meta: {
//         totalItems: this.properties.length,
//         currentPage: page,
//         totalPages: Math.ceil(this.properties.length / limit),
//         itemsPerPage: limit,
//       },
//       filtersAvailable: {
//         developers: [...new Set(this.properties.map(p => p.developerType.name))],
//         areas: [...new Set(this.properties.map(p => p.propertyArea.areaName))],
//       }
//     };
//   }
// }

import { Injectable } from '@nestjs/common';

// Existing interfaces for reference
export interface DubaiProperty {
  id: number;
  propertyName: string;
  images: { type: string; path: string }[];
  propertyArea: { id: number; areaName: string };
  developerType: { id: number; name: string };
  propertyType: { id: number; name: string };
  unitType: { size: string };
  developmentType: { id: number; name: string }; // Ensure ID is here
}

export interface PaginatedPropertyResponse {
  data: DubaiProperty[];
  meta: {
    totalItems: number;
    currentPage: number;
    totalPages: number;
    itemsPerPage: number;
  };
  filtersAvailable: {
    developers: string[];
    areas: string[];
    developmentTypes: { id: number; name: string }[]; // Added to filters
  };
}

@Injectable()
export class DubaiPropertiesService {
  private readonly properties: DubaiProperty[] = [
    {
      id: 1,
      propertyName: "Marina Shores",
      images: [
        { type: "cover", path: "/images/home/slider-1.jpeg" },
        { type: "gallery", path: "/images/prop1_alt.jpg" }
      ],
      propertyArea: { id: 101, areaName: "Dubai Marina" },
      developerType: { id: 201, name: "Emaar Properties" },
      propertyType: { id: 301, name: "Apartment" },
      unitType: { size: "1,200 sqft" },
      developmentType: { id: 1, name: "Off-Plan" }
    },
    {
      id: 2,
      propertyName: "Downtown Heights",
      images: [{ type: "cover", path: "/images/home/slider-2.jpeg" }],
      propertyArea: { id: 102, areaName: "Downtown Dubai" },
      developerType: { id: 202, name: "DAMAC Properties" },
      propertyType: { id: 301, name: "Apartment" },
      unitType: { size: "1,850 sqft" },
      developmentType: { id: 2, name: "Ready" }
    },
    {
      id: 3,
      propertyName: "Palm Residences",
      images: [{ type: "cover", path: "/images/home/slider-3.jpg" }],
      propertyArea: { id: 103, areaName: "Palm Jumeirah" },
      developerType: { id: 203, name: "Nakheel" },
      propertyType: { id: 302, name: "Villa" },
      unitType: { size: "3,200 sqft" },
      developmentType: { id: 2, name: "Ready" }
    },
    {
      id: 4,
      propertyName: "Emaar Beachfront",
      images: [{ type: "cover", path: "/images/home/slider-4.jpg" }],
      propertyArea: { id: 104, areaName: "Dubai Harbour" },
      developerType: { id: 201, name: "Emaar Properties" },
      propertyType: { id: 301, name: "Apartment" },
      unitType: { size: "900 sqft" },
      developmentType: { id: 1, name: "Off-Plan" }
    },
    {
      id: 5,
      propertyName: "Sobha Hartland",
      images: [{ type: "cover", path: "/images/home/slider-5.jpg" }],
      propertyArea: { id: 105, areaName: "MBR City" },
      developerType: { id: 204, name: "Sobha Realty" },
      propertyType: { id: 303, name: "Townhouse" },
      unitType: { size: "1,150 sqft" },
      developmentType: { id: 1, name: "Off-Plan" }
    },
    {
      id: 6,
      propertyName: "Burj Vista",
      images: [{ type: "cover", path: "/images/home/slider-6.jpg" }],
      propertyArea: { id: 102, areaName: "Downtown Dubai" },
      developerType: { id: 201, name: "Emaar Properties" },
      propertyType: { id: 304, name: "Penthouse" },
      unitType: { size: "2,100 sqft" },
      developmentType: { id: 2, name: "Ready" }
    },
    {
      id: 7,
      propertyName: "Creek Waters",
      images: [{ type: "cover", path: "/images/home/slider-1.jpeg" }],
      propertyArea: { id: 106, areaName: "Dubai Creek Harbour" },
      developerType: { id: 201, name: "Emaar Properties" },
      propertyType: { id: 301, name: "Apartment" },
      unitType: { size: "1,450 sqft" },
      developmentType: { id: 1, name: "Off-Plan" }
    },
    {
      id: 8,
      propertyName: "Damac Lagoons",
      images: [{ type: "cover", path: "/images/home/slider-2.jpeg" }],
      propertyArea: { id: 107, areaName: "Damac Hills" },
      developerType: { id: 202, name: "DAMAC Properties" },
      propertyType: { id: 303, name: "Townhouse" },
      unitType: { size: "2,200 sqft" },
      developmentType: { id: 1, name: "Off-Plan" }
    },
    {
      id: 9,
      propertyName: "Azure Residences",
      images: [{ type: "cover", path: "/images/home/slider-3.jpg" }],
      propertyArea: { id: 103, areaName: "Palm Jumeirah" },
      developerType: { id: 203, name: "Nakheel" },
      propertyType: { id: 301, name: "Apartment" },
      unitType: { size: "1,100 sqft" },
      developmentType: { id: 2, name: "Ready" }
    },
    {
      id: 10,
      propertyName: "Sobha SeaHaven",
      images: [{ type: "cover", path: "/images/home/slider-4.jpg" }],
      propertyArea: { id: 104, areaName: "Dubai Harbour" },
      developerType: { id: 204, name: "Sobha Realty" },
      propertyType: { id: 304, name: "Penthouse" },
      unitType: { size: "3,500 sqft" },
      developmentType: { id: 1, name: "Off-Plan" }
    },
    {
      id: 11,
      propertyName: "Binghatti Onyx",
      images: [{ type: "cover", path: "/images/home/slider-5.jpg" }],
      propertyArea: { id: 108, areaName: "JVC" },
      developerType: { id: 205, name: "Binghatti" },
      propertyType: { id: 301, name: "Apartment" },
      unitType: { size: "850 sqft" },
      developmentType: { id: 1, name: "Off-Plan" }
    },
    {
      id: 12,
      propertyName: "Opus by Zaha Hadid",
      images: [{ type: "cover", path: "/images/home/slider-6.jpg" }],
      propertyArea: { id: 109, areaName: "Business Bay" },
      developerType: { id: 206, name: "Omniyat" },
      propertyType: { id: 301, name: "Apartment" },
      unitType: { size: "1,600 sqft" },
      developmentType: { id: 2, name: "Ready" }
    },
    {
      id: 13,
      propertyName: "District One Villas",
      images: [{ type: "cover", path: "/images/home/slider-1.jpeg" }],
      propertyArea: { id: 105, areaName: "MBR City" },
      developerType: { id: 207, name: "Meydan" },
      propertyType: { id: 302, name: "Villa" },
      unitType: { size: "6,500 sqft" },
      developmentType: { id: 2, name: "Ready" }
    },
    {
      id: 14,
      propertyName: "Peninsula Five",
      images: [{ type: "cover", path: "/images/home/slider-2.jpeg" }],
      propertyArea: { id: 109, areaName: "Business Bay" },
      developerType: { id: 208, name: "Select Group" },
      propertyType: { id: 301, name: "Apartment" },
      unitType: { size: "1,250 sqft" },
      developmentType: { id: 1, name: "Off-Plan" }
    },
    {
      id: 15,
      propertyName: "Madinat Jumeirah Living",
      images: [{ type: "cover", path: "/images/home/slider-3.jpg" }],
      propertyArea: { id: 110, areaName: "Jumeirah" },
      developerType: { id: 209, name: "Dubai Holding" },
      propertyType: { id: 301, name: "Apartment" },
      unitType: { size: "1,350 sqft" },
      developmentType: { id: 1, name: "Off-Plan" }
    },
    {
      id: 16,
      propertyName: "The Address Fountain Views",
      images: [{ type: "cover", path: "/images/home/slider-4.jpg" }],
      propertyArea: { id: 102, areaName: "Downtown Dubai" },
      developerType: { id: 201, name: "Emaar Properties" },
      propertyType: { id: 301, name: "Apartment" },
      unitType: { size: "1,500 sqft" },
      developmentType: { id: 2, name: "Ready" }
    },
    {
      id: 17,
      propertyName: "Elegance Tower",
      images: [{ type: "cover", path: "/images/home/slider-5.jpg" }],
      propertyArea: { id: 102, areaName: "Downtown Dubai" },
      developerType: { id: 202, name: "DAMAC Properties" },
      propertyType: { id: 301, name: "Apartment" },
      unitType: { size: "1,050 sqft" },
      developmentType: { id: 1, name: "Off-Plan" }
    },
    {
      id: 18,
      propertyName: "Villanova La Rosa",
      images: [{ type: "cover", path: "/images/home/slider-6.jpg" }],
      propertyArea: { id: 111, areaName: "Dubailand" },
      developerType: { id: 210, name: "Dubai Properties" },
      propertyType: { id: 303, name: "Townhouse" },
      unitType: { size: "2,000 sqft" },
      developmentType: { id: 2, name: "Ready" }
    },
    {
      id: 19,
      propertyName: "Orchid Creek Beach",
      images: [{ type: "cover", path: "/images/home/slider-1.jpeg" }],
      propertyArea: { id: 106, areaName: "Dubai Creek Harbour" },
      developerType: { id: 201, name: "Emaar Properties" },
      propertyType: { id: 301, name: "Apartment" },
      unitType: { size: "1,150 sqft" },
      developmentType: { id: 1, name: "Off-Plan" }
    },
    {
      id: 20,
      propertyName: "Cavalli Tower",
      images: [{ type: "cover", path: "/images/home/slider-2.jpeg" }],
      propertyArea: { id: 112, areaName: "Dubai Marina" },
      developerType: { id: 202, name: "DAMAC Properties" },
      propertyType: { id: 304, name: "Penthouse" },
      unitType: { size: "4,200 sqft" },
      developmentType: { id: 1, name: "Off-Plan" }
    },
    {
      id: 21,
      propertyName: "The Valley",
      images: [{ type: "cover", path: "/images/home/slider-3.jpg" }],
      propertyArea: { id: 111, areaName: "Dubailand" },
      developerType: { id: 201, name: "Emaar Properties" },
      propertyType: { id: 303, name: "Townhouse" },
      unitType: { size: "2,150 sqft" },
      developmentType: { id: 1, name: "Off-Plan" }
    },
    {
      id: 22,
      propertyName: "Nikki Beach Residences",
      images: [{ type: "cover", path: "/images/home/slider-4.jpg" }],
      propertyArea: { id: 113, areaName: "Pearl Jumeirah" },
      developerType: { id: 211, name: "Meraas" },
      propertyType: { id: 301, name: "Apartment" },
      unitType: { size: "1,800 sqft" },
      developmentType: { id: 2, name: "Ready" }
    },
    {
      id: 23,
      propertyName: "Uptown Tower",
      images: [{ type: "cover", path: "/images/home/slider-5.jpg" }],
      propertyArea: { id: 114, areaName: "JLT" },
      developerType: { id: 212, name: "DMCC" },
      propertyType: { id: 301, name: "Apartment" },
      unitType: { size: "1,400 sqft" },
      developmentType: { id: 2, name: "Ready" }
    },
    {
      id: 24,
      propertyName: "Marbella Villas",
      images: [{ type: "cover", path: "/images/home/slider-6.jpg" }],
      propertyArea: { id: 115, areaName: "Mina Al Arab" },
      developerType: { id: 213, name: "RAK Properties" },
      propertyType: { id: 302, name: "Villa" },
      unitType: { size: "3,800 sqft" },
      developmentType: { id: 2, name: "Ready" }
    },
    {
      id: 25,
      propertyName: "Seven Palm",
      images: [{ type: "cover", path: "/images/home/slider-1.jpeg" }],
      propertyArea: { id: 103, areaName: "Palm Jumeirah" },
      developerType: { id: 214, name: "Seven Tides" },
      propertyType: { id: 301, name: "Apartment" },
      unitType: { size: "800 sqft" },
      developmentType: { id: 2, name: "Ready" }
    },
    {
      id: 26,
      propertyName: "One Canal",
      images: [{ type: "cover", path: "/images/home/slider-2.jpeg" }],
      propertyArea: { id: 116, areaName: "Dubai Water Canal" },
      developerType: { id: 215, name: "Luxe Developers" },
      propertyType: { id: 304, name: "Penthouse" },
      unitType: { size: "5,500 sqft" },
      developmentType: { id: 1, name: "Off-Plan" }
    },
    {
      id: 27,
      propertyName: "Ritz-Carlton Residences",
      images: [{ type: "cover", path: "/images/home/slider-3.jpg" }],
      propertyArea: { id: 106, areaName: "Dubai Creek Harbour" },
      developerType: { id: 216, name: "MAG Group" },
      propertyType: { id: 302, name: "Villa" },
      unitType: { size: "7,200 sqft" },
      developmentType: { id: 1, name: "Off-Plan" }
    },
    {
      id: 28,
      propertyName: "Safeer Tower 2",
      images: [{ type: "cover", path: "/images/home/slider-4.jpg" }],
      propertyArea: { id: 109, areaName: "Business Bay" },
      developerType: { id: 217, name: "Al Seeb" },
      propertyType: { id: 301, name: "Apartment" },
      unitType: { size: "950 sqft" },
      developmentType: { id: 2, name: "Ready" }
    },
    {
      id: 29,
      propertyName: "Jumeirah Living Marina Gate",
      images: [{ type: "cover", path: "/images/home/slider-5.jpg" }],
      propertyArea: { id: 112, areaName: "Dubai Marina" },
      developerType: { id: 208, name: "Select Group" },
      propertyType: { id: 301, name: "Apartment" },
      unitType: { size: "1,750 sqft" },
      developmentType: { id: 2, name: "Ready" }
    },
    {
      id: 30,
      propertyName: "Ellington Belgravia",
      images: [{ type: "cover", path: "/images/home/slider-6.jpg" }],
      propertyArea: { id: 108, areaName: "JVC" },
      developerType: { id: 218, name: "Ellington Properties" },
      propertyType: { id: 301, name: "Apartment" },
      unitType: { size: "1,100 sqft" },
      developmentType: { id: 2, name: "Ready" }
    }
  ];

  findAll(
    page: number = 1,
    limit: number = 12,
    developmentTypeId?: number
  ): PaginatedPropertyResponse {
    // 1. Ensure numeric types to prevent JS math quirks
    const p = Number(page) > 0 ? Number(page) : 1;
    const l = Number(limit) > 0 ? Number(limit) : 12;

    // 2. Filter the data first
    let filteredItems = this.properties;

    if (developmentTypeId) {
      filteredItems = this.properties.filter(
        (item) => item.developmentType.id === Number(developmentTypeId)
      );
    }

    // 3. Calculate pagination based on the FILTERED items
    const startIndex = (p - 1) * l;
    const endIndex = startIndex + l;
    const paginatedItems = filteredItems.slice(startIndex, endIndex);

    return {
      data: paginatedItems,
      meta: {
        totalItems: filteredItems.length, // Total count of filtered items
        currentPage: p,
        totalPages: Math.ceil(filteredItems.length / l),
        itemsPerPage: l,
      },
      filtersAvailable: {
        developers: [...new Set(this.properties.map(p => p.developerType.name))],
        areas: [...new Set(this.properties.map(p => p.propertyArea.areaName))],
        // Mapping development types for the frontend filter UI
        developmentTypes: Array.from(
          new Map(this.properties.map(p => [p.developmentType.id, p.developmentType])).values()
        ),
      }
    };
  }
}