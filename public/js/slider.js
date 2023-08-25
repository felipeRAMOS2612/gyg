window.addEventListener('load', function(){
    new Glider(document.querySelector('.swiper'), {
        slidesToShow: 1,
  arrows: {
    prev: '.glider-prev',
    next: '.glider-next'
  },
  responsive: [
    {
        // screens greater than >= 775px
        breakpoint: 284,
        settings: {
          // Set to `auto` and provide item width to adjust to viewport
          slidesToShow: 1,
          slidesToScroll: 1,    
          duration: 1,
        }
      },
      {
        // screens greater than >= 775px
        breakpoint: 355,
        settings: {
          // Set to `auto` and provide item width to adjust to viewport
          slidesToShow: 1,
          slidesToScroll: 1,
          duration: 1,
        }
      },

      {
        // screens greater than >= 775px
        breakpoint: 415,
        settings: {
          // Set to `auto` and provide item width to adjust to viewport
          slidesToShow: 2,
          slidesToScroll: 1,
          duration: 1,
        }
      },
    {
      // screens greater than >= 775px
      breakpoint: 685,
      settings: {
        // Set to `auto` and provide item width to adjust to viewport
        slidesToShow: 1,
        slidesToScroll: 'auto',
        itemWidth: 150,
        duration: 1
      }
    },{
      // screens greater than >= 1024px
      breakpoint: 992,
      settings: {
        slidesToShow: 1,
        slidesToScroll: 1,
        duration: 1
      }
    }
  ]
    })
})
