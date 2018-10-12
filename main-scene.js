/* Here's a complete, working example of a Shape subclass.  It is a blueprint for a cube. */
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


window.Cube_Outline = window.classes.Cube_Outline = class Cube_Outline extends Shape
{
  constructor()
  {
    /* Name the values we'll define per each vertex. */
    super( "positions", "colors" );

    /* TODO (Requirement 5). When a set of lines is used in graphics, you should think of the list entries as broken
     * down into pairs; each pair of vertices will be drawn as a line segment. */

    /* Do this so we won't need to define "this.indices". */
    this.indexed = false;
  }
}

window.Cube_Single_Strip = window.classes.Cube_Single_Strip = class Cube_Single_Strip extends Shape
{
  constructor()
  {
    super( "positions", "normals" );

    /* TODO (Extra credit part I) */
  }
}


window.Assignment_One_Scene = window.classes.Assignment_One_Scene = class Assignment_One_Scene extends Scene_Component
/* The scene begins by requesting the camera, shapes, and materials it will need. */
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
  }

  set_colors()
  {
    /* TODO:  Create a class member variable to store your cube's colors. */

  }

  /* Draw the scene's buttons, setup their actions and keyboard shortcuts, and monitor live measurements. */
  make_control_panel()
  {
    /* Add a button for controlling the scene. */
    this.key_triggered_button( "Change Colors", [ "c" ], this.set_colors );

    /* TODO:  Requirement 5b:  Set a flag here that will toggle your outline on and off */
    this.key_triggered_button( "Outline", [ "o" ], () => {
    } );

    /* TODO:  Requirement 3d:  Set a flag here that will toggle your swaying motion on and off. */
    this.key_triggered_button( "Sit still",     [ "m" ], () => {

    } );
  }

  draw_box( graphics_state, model_transform )
  {
    /* TODO:  Helper function for requirement 3 (see hint). This should make changes to the model_transform matrix, draw
     * the next box, and return the newest model_transform. */

    return model_transform;
  }

  display( graphics_state )
  {
    /* Use the lights stored in this.lights. */
    graphics_state.lights = this.lights;

    let model_transform = Mat4.identity();

    /* TODO:  Draw your entire scene here.  Use this.draw_box( graphics_state, model_transform ) to call your helper. */
  }

}
