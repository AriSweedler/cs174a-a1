/* Here's a complete, working example of a Shape subclass. It is a blueprint for a cube. */
window.Cube = window.classes.Cube = class Cube extends Shape
{
  constructor()
  {
    /* Name the values we'll define per each vertex.  They'll have positions and normals. */
    super( "positions", "normals" );

    /* First, specify the vertex positions -- just a bunch of points that exist at the corners of an imaginary cube. */
    this.positions.push( ...Vec.cast( [-1,-1,-1], [1,-1,-1], [-1,-1,1], [1,-1,1], [1,1,-1],  [-1,1,-1],  [1,1,1],  [-1,1,1],
                                      [-1,-1,-1], [-1,-1,1], [-1,1,-1], [-1,1,1], [1,-1,1],  [1,-1,-1],  [1,1,1],  [1,1,-1],
                                      [-1,-1,1],  [1,-1,1],  [-1,1,1],  [1,1,1], [1,-1,-1], [-1,-1,-1], [1,1,-1], [-1,1,-1] ) );
    /* Supply vectors that point away from eace face of the cube.  They should match up with the points in the above
     * list Normal vectors are needed so the graphics engine can know if the shape is pointed at light or not, and color
     * it accordingly. */
    this.normals.push(   ...Vec.cast( [0,-1,0], [0,-1,0], [0,-1,0], [0,-1,0], [0,1,0], [0,1,0], [0,1,0], [0,1,0], [-1,0,0], [-1,0,0],
                                      [-1,0,0], [-1,0,0], [1,0,0],  [1,0,0],  [1,0,0], [1,0,0], [0,0,1], [0,0,1], [0,0,1],   [0,0,1],
                                      [0,0,-1], [0,0,-1], [0,0,-1], [0,0,-1] ) );


    /* Those two lists, positions and normals, fully describe the "vertices".  What's the "i"th vertex?  Simply the
     * combined data you get if you look up index "i" of both lists above -- a position and a normal vector, together.
     * Now let's tell it how to connect vertex entries into triangles.  Every three indices in this list makes one
     * triangle: */
    this.indices.push( 0, 1, 2, 1, 3, 2, 4, 5, 6, 5, 7, 6, 8, 9, 10, 9, 11, 10, 12, 13, 14, 13, 15, 14, 16, 17, 18, 17,
        19, 18, 20, 21, 22, 21, 23, 22 );
    /* It stinks to manage arrays this big.  Later we'll show code that generates these same cube vertices more
     * automatically. */
  }
}

/* draw just the outline of a cube */
window.Cube_Outline = window.classes.Cube_Outline = class Cube_Outline extends Shape
{
  constructor()
  {
    /* Name the values we'll define per each vertex. */
    super( "positions", "colors" );

    /* Do this so we won't need to define "this.indices". */
    this.indexed = false;

    /* each pair of vertices will be drawn as a line segment. We want a line for each corner of the cube */
    let corners = Array(8);
    for (let i = 0; i < corners.length; i++) {
      corners[i] = new Vec([
          i&1 ? -1 : 1,
          i&2 ? -1 : 1,
          i&4 ? -1 : 1,
      ]);
    }

    this.positions.push(
        corners[0], corners[1],
        corners[0], corners[2],
        corners[0], corners[4],
        corners[1], corners[3],
        corners[1], corners[5],
        corners[2], corners[3],
        corners[2], corners[6],
        corners[3], corners[7],
        corners[4], corners[5],
        corners[4], corners[6],
        corners[5], corners[7],
        corners[6], corners[7]
        );

    /* for each item in the this.positions array, add a whiteColor to the this.colors array */
    let whiteColor = Color.of(1, 1, 1, 1);
    this.colors = this.positions.map(i => whiteColor);
  }
}

/* draw a cube using triangles instead of squares */
window.Cube_Single_Strip = window.classes.Cube_Single_Strip = class Cube_Single_Strip extends Shape
{
  constructor()
  {
    super( "positions", "normals" );

    /* Do this so we won't need to define "this.indices". */
    this.indexed = false;

    /* each triplet of vertices will be drawn as a triangle. We want a pair of triangles for each face of the cube */
    let corners = Array(8);
    for (let i = 0; i < corners.length; i++) {
      corners[i] = new Vec([
          i&1 ? -1 : 1,
          i&2 ? -1 : 1,
          i&4 ? -1 : 1,
      ]);
    }

    let norm_face = Vec.cast([1,0,0], [0,1,0], [0,0,1], [-1,0,0], [0,-1,0], [0,0,-1]);
    this.positions.push(
        corners[0], corners[6], corners[2],
        corners[0], corners[6], corners[4],

        corners[0], corners[5], corners[1],
        corners[0], corners[5], corners[4],

        corners[0], corners[3], corners[1],
        corners[0], corners[3], corners[2],

        corners[7], corners[1], corners[3],
        corners[7], corners[1], corners[5],

        corners[7], corners[2], corners[3],
        corners[7], corners[2], corners[6],

        corners[7], corners[4], corners[5],
        corners[7], corners[4], corners[6],
        );

    for (let face = 0; face < 6; face++) {
      for (let v = 0; v < 6; v++) {
        this.normals.push(norm_face[face]);
      }
    }
  }
}

/* example scene given to us by prof */
window.Transforms_Sandbox = window.classes.Transforms_Sandbox = class Transforms_Sandbox extends Tutorial_Animation
{
  /* This subclass of some other Scene overrides the display() function.  By only exposing that one function, which
   * draws everything, this creates a very small code sandbox for editing a simple scene, and for experimenting with
   * matrix transforms. */
  display( graphics_state )
  {
    /* define color constants */
    const blue = Color.of( 0,0,1,1 );
    const yellow = Color.of( 1,1,0,1 );

    /* Use the lights stored in this.lights. */
    graphics_state.lights = this.lights;

    /* Find how much time has passed in seconds, and use that to place shapes. */
    const deltaTime = this.deltaTime = graphics_state.animation_time/1000;

    /* Variable model_transform will be a temporary matrix that helps us draw most shapes. It starts over as the
     * identity every single frame. Useful for drawing most shapes */
    let model_transform = Mat4.identity();

    /* From here on down it's just some example shapes drawn for you -- freely replace them with your own!  Notice the
     * usage of the functions translation(), scale(), and rotation() to generate matrices, and the functions times(),
     * which generates products of matrices. */

    const top_box_transform = model_transform = model_transform.times( Mat4.translation([ 0, 3, 15 ]) );

    /* Tweak our coordinate system downward so we can draw the next shape. */
    const ball_transform = model_transform = model_transform.times( Mat4.translation([ 0, -2, 0 ]) );

    if( !this.hover ) {
      /* Spin our coordinate frame around the y-axis as a function of time. (time == radians to translate by) */
      let yAxis = Vec.of( 0,1,0 );
      model_transform = model_transform.times( Mat4.rotation( deltaTime, yAxis ) )
    }

    /* Rotate about z by 1 radian. (Translate cube down so it doesn't hit the sphere. Scale to make the box a rectangle.) */
    const bottom_box_transform = model_transform = model_transform.times( Mat4.rotation( 1, Vec.of( 0,0,1 ) ) )
      .times( Mat4.translation([ 0, -3, 0 ]) )
      .times( Mat4.scale([ 1, 2, 1 ]) );

    /* Draw */
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        let balls_out = top_box_transform.times( Mat4.translation([5*i, 5*j, 0]));
        this.shapes.box.draw( graphics_state, balls_out, this.plastic.override({ color: Color.of( j/10,i/10,0,1 ) }) );
      }
    }
    this.shapes.ball.draw( graphics_state, ball_transform, this.plastic.override({ color: blue }) );
    this.shapes.box.draw( graphics_state, bottom_box_transform, this.plastic.override({ color: yellow }) );
  }
}

/* my scene */
window.Assignment_One_Scene = window.classes.Assignment_One_Scene = class Assignment_One_Scene extends Scene_Component
{
  /* First, include a secondary Scene that provides movement controls: */
  constructor( context, control_box )
  {
    super( context, control_box );
    if( !context.globals.has_controls   ) {
      context.register_scene_component( new Movement_Controls( context, control_box.parentElement.insertCell() ) );
    }

    const r = context.width/context.height;
    /* Locate the camera here (inverted matrix). */
    context.globals.graphics_state.camera_transform = Mat4.translation([ 5,-10,-30 ]);
    context.globals.graphics_state.projection_transform = Mat4.perspective( Math.PI/4, r, .1, 1000 );

    /* At the beginning of our program, load one of each of these shape definitions onto the GPU.  NOTE:  Only do this
     * ONCE per shape design.  Once you've told the GPU what the design of a cube is, it would be redundant to tell it
     * again.  You should just re-use the one called "box" more than once in display() to draw multiple cubes.  Don't
     * define more than one blueprint for the same thing here. */
    const shapes = { 'box': new Cube(), 'strip': new Cube_Single_Strip(), 'outline': new Cube_Outline() }
    this.submit_shapes( context, shapes );

    /* Make some Material objects available to you: */
    this.clay   = context.get_instance( Phong_Shader ).material( Color.of( .9,.5,.9, 1 ), { ambient: .4, diffusivity: .4 } );
    this.white  = context.get_instance( Basic_Shader ).material();
    this.plastic = this.clay.override({ specularity: .6 });

    this.lights = [ new Light( Vec.of( 0,5,5,1 ), Color.of( 1, .4, 1, 1 ), 100000 ) ];

    this.set_colors();

    /******************************************* parameters of box rotation *******************************************/
    /* Because we sweep from 0 to max angle as a function of time, we get a nice swaying motion */
    this.maxAngle = -.04*Math.PI;
    this.hertz = 3;
    this.phase = 0;

    /**************************************** booleans flipped by the buttons ****************************************/
    this.is_swaying = true;
    this.drawing_outlines = false;
    this.extraCreditII = true;

    /********************************************** my defined constants **********************************************/
    this.zAxis = Vec.of( 0, 0, 1 );
    this.extraCreditIIScale = Vec.of( 1, 1.5, 1 );

    /********************************************** debugging constants **********************************************/
    this.prevTime = 0;
    this.tick = false;
  }

  /* set this.boxColors to these 8 colors, in a random order */
  set_colors()
  {
    /* colors */
    let colors = [
      Color.of( 0.9,0.9,0.9,1 ), /*white*/
      Color.of( 1,0,0,1 ), /*red*/
      Color.of( 1,0.647,0,1 ), /*orange*/
      Color.of( 1,1,0,1 ), /*yellow*/
      Color.of( 0,1,0,1 ), /*green*/
      Color.of( 0,0,1,1 ), /*blue*/
      Color.of( 1,0,1,1 ), /*purple*/
      Color.of( 0.588,0.294,0,1 ) /*brown*/
    ]

    this.boxColors = Array();
    for (let i = 0; i < 8; i++ ) {
      let randomIndex = Math.floor(Math.random() * colors.length);
      this.boxColors.push(colors[randomIndex]);
      colors[randomIndex] = colors[colors.length-1];
      colors.pop();
    }

  }

  /* Draw the scene's buttons, setup their actions and keyboard shortcuts, and monitor live measurements. */
  make_control_panel()
  {
    /* Add a button for controlling the scene. */
    this.key_triggered_button( "Change Colors", [ "c" ], this.set_colors );

    /* toggle your outline on and off */
    this.key_triggered_button( "Outline", [ "o" ], () => {
      this.drawing_outlines = !this.drawing_outlines;
    } );

    /* toggle swaying on and off */
    this.key_triggered_button( "Sit still", [ "m" ], () => {
      this.is_swaying = !this.is_swaying;
    } );

    /* toggle extra credit scaling on and off */
    this.key_triggered_button( "Extra credit part II", [ "x" ], () => {
      this.extraCreditII = !this.extraCreditII;
    } );
  }

  draw_box_stack (graphics_state)
  {
    /* start with the unit vector each time */
    let model_transform = Mat4.identity();

    /* extra credit:
     * Scale your boxes so that instead of being unit cubes, they are stretched to 1.5x their length only along the Y axis */
    if (this.extraCreditII) {
      model_transform = model_transform
          .times( Mat4.translation( this.extraCreditIIScale.minus(Vec.of(1, 1, 1)) ) ) /* hold the bottom left corner constant */
          .times( Mat4.scale(this.extraCreditIIScale) );
    }

    /******************** calculate how many radians we should rotate *******************/
    /* if hertz == 1, then deltaTime++ will increase the phase by 1 full period */
    const nextPhase = this.deltaTime * Math.PI*2 * this.hertz;
    /* only update our phase if this.is_swaying = true */
    this.phase = (this.is_swaying) ? nextPhase : this.phase;

    /* This formula is of the form `f(t) = a + a*sin(w*t)`, to sweep from 0 to 2a and back in a smooth motion */
    const halfMaxAngle = this.maxAngle/2;
    const rad = halfMaxAngle + halfMaxAngle*Math.sin(this.phase);

    /* move each box's origin 2 units higher than the previous one. */
    const box_height_up = [ 0, 2, 0 ];
    /* We want our rotation to work on the bottom right of the boxes. To do so, we will translate from center to bottom right, rotate, then translate back */
    const center_to_bottom_right = [ 1, -1, 0 ];
    const bottom_right_to_center = center_to_bottom_right.map(num => -num);

    /* extraCreditI: draw the first box with triangle strips */
    this.shapes.strip.draw (graphics_state, model_transform, this.plastic.override({ color: this.boxColors[0] }), "TRIANGLE_STRIP");

    /* draw the rest of the boxes */
    for (let boxNum = 1; boxNum < 8; boxNum++) {
      /* find the transform of the next box */
      model_transform = model_transform
          /* move the next box up */
          .times( Mat4.translation(box_height_up) )
          /* then rotate it from the bottom right on the z axis */
          .times( Mat4.translation(center_to_bottom_right) )
          .times( Mat4.rotation(rad, this.zAxis) )
          .times( Mat4.translation(bottom_right_to_center) );

      /* draw the next box */
      if (this.drawing_outlines) {
        this.shapes.outline.draw( graphics_state, model_transform, this.white, "LINES");
      } else {
        this.shapes.box.draw( graphics_state, model_transform, this.plastic.override({ color: this.boxColors[boxNum] }) );
      }

    }

  }

  debug_tickspeed(rad)
  {
    if (this.tick && rad < 0.9*this.maxAngle) {
      const diff = this.deltaTime - this.prevTime;
      console.log(`Tick speed: ${diff} (~${1/diff} Hz)`);
      this.prevTime = this.deltaTime;
      this.tick = false;
    } else if (!this.tick && rad > 0.1*this.maxAngle) {
      this.tick = true;
    }
  }

  display( graphics_state )
  {
    /* Use the lights stored in this.lights. */
    graphics_state.lights = this.lights;

    /* record how much time has passed in seconds, so we can use that to place shapes. */
    this.deltaTime = graphics_state.animation_time/1000;

    /* draw the swaying box stack */
    this.draw_box_stack(graphics_state);
  }

}
